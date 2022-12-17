import { Component } from 'react';
import Form from "@rjsf/antd";
import localValidator from "@rjsf/validator-ajv6";
import './App.css';
import { GetAppInfo, LoadJSON, SaveJSON, RunExecCore, SelectExistConfigFile, SelectSaveConfigFile } from "../wailsjs/go/main/App";
import { WindowSetTitle } from "../wailsjs/runtime";
import { Button, Col, Divider, Layout, Row, Space, Typography } from 'antd';

const { Title } = Typography;

const tmpCfgName = "tmpCfg.json"

export default class App extends Component {
    state = {
        appInfo: {
            "code": 0,
            "schemaObj": testSchema,
            "schema": JSON.stringify(testSchema),
            "appOptions": {
                "appTitle": "Easy GUI Demo",
                "version": "v0.0.1"
            },
            "error": ""
        },
        formData: {

        },
        currentCfgName: tmpCfgName
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

    componentDidMount() {
        GetAppInfo().then(this.onLoadSchema).catch(this.onError)
        LoadJSON(tmpCfgName).then(this.onLoadFormData).catch(this.onLoadFormDataError)
        /*
        {
        "code": 0,
        "schema": "{\"$ref\":\"#/$defs/Args\",\"$defs\":{\"Args\":{\"properties\":{\"id\":{\"type\":\"integer\"},\"name\":{\"type\":\"string\"}},\"additionalProperties\":false,\"type\":\"object\",\"required\":[\"id\",\"name\"]}}}",
        "appOptions": {
            "appTitle": "Easy GUI Demo",
            "version": "v0.0.1"
        },
        "error": ""
        }
*/
    }

    SelectExistConfigFile = () => {
        SelectExistConfigFile(this.state.currentCfgName).then(this.onSelectCfgFile)
    }

    SelectSaveConfigFile = () => {
        SelectSaveConfigFile(this.state.currentCfgName).then(this.onSelectSaveCfgFile)
    }

    onSelectCfgFile = (name) => {
        if (name) {
            this.setState({
                currentCfgName: name
            })
            LoadJSON(name).then(this.onLoadFormData).catch(this.onLoadFormDataError);
        }
    }

    onSelectSaveCfgFile = (name) => {
        if (name) {
            this.setState({
                currentCfgName: name
            })
        }
    }

    render() {
        return (
            <Layout>
                <Layout.Content>
                    <Row>
                        <Col offset={2} span={20}>
                            <Title style={{marginTop:"10px"}}>
                                {this.state.appInfo.appOptions.appTitle}
                            </Title>
                            <Divider />
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={2} span={20}>
                            <Space>
                                <div>
                                    <Form schema={this.state.appInfo.schemaObj} validator={localValidator} onSubmit={this.onSubmit} uiSchema={this.UISchema} formData={this.state.formData} />
                                    <Button type="default" onClick={this.SelectExistConfigFile}>Load Config</Button> <Button type="default" onClick={this.SelectSaveConfigFile}>Save As</Button>
                                </div>
                            </Space>
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
