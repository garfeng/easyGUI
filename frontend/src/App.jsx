import { Component } from 'react';
import Form from "@rjsf/antd";
import localValidator from "@rjsf/validator-ajv6";
import './App.css';
import { GetAppInfo, LoadJSON, SaveJSON, RunExecCore, SelectExistConfigFile, SelectSaveConfigFile, LoadRecentData, SaveRecentData } from "../wailsjs/go/main/App";
import { WindowSetTitle } from "../wailsjs/runtime";
import { Button, Col, Divider, Input, Layout, Row, Space, Typography } from 'antd';
import { model } from '../wailsjs/go/models';

const { Title } = Typography;


export default class App extends Component {
    state = {
        appInfo: {
            code: 0,
            schemaObj: testSchema,
            schema: JSON.stringify(testSchema),
            appOptions: {
                appTitle: "Easy GUI Demo",
                version: "v0.0.1",
                buttonLoadText: "",
                buttonSaveAsText: "",
                submitButtonText: "",
            },
            error: ""
        },
        formData: {

        },
        currentCfgName:"tmpCfg.json",

        execResult: {}
    }

    recentData = {
        recentCfgFiles: []
    }

    onSubmit = (data, event) => {
        this.setState({
            formData: data.formData,
        })
        console.log(data.formData)
        RunExecCore(this.state.currentCfgName, JSON.stringify(data.formData)).then(this.onExecCoreFinished).catch(this.onExecCoreError)
    }

    onExecCoreFinished = (data) => {
        console.log("run result:", data)
        this.setState({
            execResult:data
        })
    }

    GetLog = () => {
        var s = "";
        for (var key in this.state.execResult) {
            if (this.state.execResult[key]) {
                s += `${new Date().toLocaleTimeString()} [${key}]: ${this.state.execResult[key]}`
            }
        }
        return s
    }

    onExecCoreError = (error) => {
        console.log("Error exec Core", error)
    }

    onLoadSchema = (data) => {
        var appInfo = JSON.parse(data);
        console.log(appInfo)

        if (appInfo.schema && appInfo.code == 0) {
            appInfo.schemaObj = JSON.parse(appInfo.schema)
        } else {
            console.log(appInfo.error);
        }
        this.setState({
            appInfo: appInfo,
        })
        console.log(appInfo)
        WindowSetTitle(appInfo.appOptions.appTitle)
    }

    onError = (error) => {
        console.log(error)
    }

    onLoadFormData = (data) => {
        this.setState({
            formData: JSON.parse(data)
        }
        )
    }

    onLoadFormDataError = (error) => {
        console.log(error)
    }

    onLoadRecentData = (data) => {
        if (data.recentCfgFiles == null || data.recentCfgFiles.length == 0) {
            data.recentCfgFiles = ["tmpCfg.json"]
        }

        this.recentData = data;
        this.setState({
            currentCfgName : data.recentCfgFiles[0]
        })

        LoadJSON(data.recentCfgFiles[0]).then(this.onLoadFormData).catch(this.onLoadFormDataError)
    }

    componentDidMount() {
        GetAppInfo().then(this.onLoadSchema).catch(this.onError)
        LoadRecentData().then(this.onLoadRecentData).catch(this.onError)
    }

    SelectExistConfigFile = () => {
        SelectExistConfigFile(this.state.currentCfgName).then(this.onSelectCfgFile)
    }

    SelectSaveConfigFile = () => {
        SelectSaveConfigFile(this.state.currentCfgName).then(this.onSelectSaveCfgFile)
    }

    UpdateRecentData = (name) => {
        if (name != this.state.currentCfgName) {
            this.recentData.recentCfgFiles.unshift(name);
            SaveRecentData(this.recentData);
        }
    }

    onSelectCfgFile = (name) => {
        if (name) {
            this.UpdateRecentData(name);
            this.setState({
                currentCfgName: name
            })
            LoadJSON(name).then(this.onLoadFormData).catch(this.onLoadFormDataError);
        }
    }

    onSelectSaveCfgFile = (name) => {
        if (name) {
            this.UpdateRecentData(name);
            this.setState({
                currentCfgName: name
            })
            SaveJSON(name, JSON.stringify(this.state.formData))
        }
    }

    render() {
        const appOptions = this.state.appInfo.appOptions;
        this.UISchema['ui:submitButtonOptions'].submitText = appOptions.submitButtonText || "Run";
        return (
            <Layout>
                <Layout.Content>
                    <Row>
                        <Col offset={1} span={22}>
                            <Title style={{ marginTop: "10px" }}>
                                {this.state.appInfo.appOptions.appTitle}
                            </Title>
                            <Divider />
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={1} span={11}>
                            <Space>
                                <div>
                                    <Form schema={this.state.appInfo.schemaObj} validator={localValidator} onSubmit={this.onSubmit} uiSchema={this.UISchema} formData={this.state.formData} />
                                    <Button.Group>
                                    <Button type="default" onClick={this.SelectExistConfigFile}>{appOptions.buttonLoadText || "Load"}</Button> <Button type="default" onClick={this.SelectSaveConfigFile}>{appOptions.buttonSaveAsText || "Save As"}</Button>
                                    </Button.Group>
                                </div>
                            </Space>
                        </Col>
                        <Col span={10} offset={1}>
                            <Input.TextArea placeholder='Log' style={{width:"100%", height:"100%"}} readOnly value={this.GetLog()}/>
                        </Col>
                    </Row>
                </Layout.Content>
                <Layout.Footer></Layout.Footer>
            </Layout>
        )
    }

    UISchema = {
        "ui:submitButtonOptions": {
            "submitText": "Run",
            "norender": false,
            "props": {
                "disabled": false,
                "className": "submit-run-app",
                "type": "primary"
            }
        }
    }
}


const testSchema = {
    "$id": "https://github.com/garfeng/easyGUI/core/schema/test-user",
    "$ref": "#/$defs/TestUser",
    "$defs": {
        "TestUser": {
            "oneOf": [
                {
                    "required": [
                        "birth_date"
                    ],
                    "title": "date"
                },
                {
                    "required": [
                        "year_of_birth"
                    ],
                    "title": "year"
                }
            ],
            "properties": {
                "id": {
                    "type": "integer"
                },
                "name": {
                    "type": "string",
                    "title": "the name",
                    "description": "The name of a friend",
                    "default": "alex",
                    "examples": [
                        "joe",
                        "lucy"
                    ]
                },
                "friends": {
                    "items": {
                        "type": "integer"
                    },
                    "type": "array",
                    "description": "The list of IDs, omitted when empty"
                },
                "tags": {
                    "type": "object",
                    "a": "b",
                    "foo": [
                        "bar",
                        "bar1"
                    ]
                },
                "birth_date": {
                    "type": "string",
                    "format": "date-time"
                },
                "year_of_birth": {
                    "type": "string"
                },
                "metadata": {
                    "oneOf": [
                        {
                            "type": "string"
                        },
                        {
                            "type": "array"
                        }
                    ]
                },
                "fav_color": {
                    "type": "string",
                    "enum": [
                        "red",
                        "green",
                        "blue"
                    ]
                }
            },
            "additionalProperties": false,
            "type": "object",
            "required": [
                "id",
                "name"
            ]
        }
    }
}
