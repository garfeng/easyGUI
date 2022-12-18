import { Component } from 'react';
import Form from "@rjsf/antd";
import localValidator from "@rjsf/validator-ajv8";
import './App.css';
import { GetAppInfo, LoadJSON, SaveJSON, RunExecCore, SelectExistConfigFile, SelectSaveConfigFile, LoadRecentData, SaveRecentData, SelectFile } from "../wailsjs/go/main/App";
import { WindowSetTitle } from "../wailsjs/runtime";
import { Button, Col, Divider, Input, Layout, Row, Space, Switch, Typography, Form as AntdForm, Select } from 'antd';
import { model } from '../wailsjs/go/models';
import FormItem from 'antd/es/form/FormItem';

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
        currentCfgName: "tmpCfg.json",

        execResult: {},

        recentOptions: []
    }

    recentData = {
        recentCfgFiles: []
    }

    onSubmit = (data, event) => {
        this.setState({
            formData: data.formData,
        })

        RunExecCore(this.state.currentCfgName, JSON.stringify(data.formData)).then(this.onExecCoreFinished).catch(this.onExecCoreError)
    }

    onExecCoreFinished = (data) => {
        this.setState({
            execResult: data
        })
    }

    GetLog = () => {
        var s = "";
        var keys = ["stdout", "stderr", "error"]

        keys.map((key) => {
            if (this.state.execResult[key]) {
                s += `${new Date().toLocaleTimeString()} [${key}]: ${this.state.execResult[key]}`
            }
        })
        return s
    }

    onExecCoreError = (error) => {
    }

    onLoadSchema = (data) => {
        var appInfo = JSON.parse(data);

        if (appInfo.schema && appInfo.code == 0) {
            appInfo.schemaObj = JSON.parse(appInfo.schema)
        } else {
        }
        this.setState({
            appInfo: appInfo,
        })
        WindowSetTitle(appInfo.appOptions.appTitle)
    }

    onError = (error) => {
    }

    onLoadFormData = (buff) => {
        var data = JSON.parse(buff);

        this.setState({
            formData: data
        }
        )
    }

    onLoadFormDataError = (error) => {
    }

    updateRecentOptions() {
        var recentOptions = [];

        for (var i = 0; i < this.recentData.recentCfgFiles.length; i++) {
            var value = this.recentData.recentCfgFiles[i];
            var label = "";
            if (value.length < 30) {
                label = value;
            } else {
                label = value.substring(0, 10) + "..." + value.substring(value.length - 20)
            }
            recentOptions.push({
                label: label,
                value: value,
            })
        }
        this.setState({
            recentOptions: recentOptions
        })
    }

    onLoadRecentData = (data) => {
        if (data.recentCfgFiles == null || data.recentCfgFiles.length == 0) {
            data.recentCfgFiles = ["tmpCfg.json"]
        }

        this.recentData = data;

        this.setState({
            currentCfgName: data.recentCfgFiles[0]
        })

        this.updateRecentOptions();

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
        var newRecentCfgFiles = [name];
        this.recentData.recentCfgFiles.map((d) => {
            if (d != name) {
                newRecentCfgFiles.push(d);
            }
        })

        this.recentData.recentCfgFiles = newRecentCfgFiles;
        SaveRecentData(this.recentData);

        this.updateRecentOptions();
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

    CustomCheckbox = (props) => {
        return (
            <Switch checked={props.value} onChange={(checked) => { props.onChange(checked) }} />
        )
    }



    CustomTextWidget = (props) => {
        return <Input.TextArea value={props.value} onChange={(str) => {
            props.onChange(str)
        }}></Input.TextArea>
    }


    CustomFieldTemplate = (props) => {
        const { id, classNames, label, help, required, description, errors, children } = props;

        return (
            <div style={{ paddingBottom: "10px" }}>
                <AntdForm.Item label={label} labelAlign="right" labelCol={{ span: 5 }} help={description}>
                    {children}
                    {errors}
                    {help}
                </AntdForm.Item>
            </div>
        )
    }


    render() {
        const myValidator = new MyValidator(this.state.appInfo.appOptions.refuseAdditionalProperties || false)

        const appOptions = this.state.appInfo.appOptions;
        this.UISchema['ui:submitButtonOptions'].submitText = appOptions.submitButtonText || "Run";
        const widgets = {
            CheckboxWidget: this.CustomCheckbox,
            FileWidget: EasyFileInput,
        };

        return (
            <Layout style={{ paddingTop: "1rem" }}>
                <Layout.Content>
                    <Layout.Content>
                        <Row>
                            <Col offset={1} span={22}>
                                <AntdForm.Item label={this.state.appInfo.appOptions.recentFileText || "Recently configs"} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} style={{ width: "100%" }}>
                                    <Input.Group compact style={{ width: "100%" }}>
                                        <Select style={{ width: "60%" }} options={this.state.recentOptions}
                                            value={this.state.currentCfgName} onSelect={this.onSelectCfgFile} />
                                        <Button type="default" style={{ maxWidth: "20%" }} onClick={this.SelectExistConfigFile}>{appOptions.buttonLoadText || "Load"}</Button>
                                        <Button type="default" style={{ maxWidth: "20%" }} onClick={this.SelectSaveConfigFile}>{appOptions.buttonSaveAsText || "Save As"}</Button>
                                    </Input.Group>
                                </AntdForm.Item>
                                <Divider />
                            </Col>
                        </Row>

                    </Layout.Content>
                    <Layout.Content>
                        <Row>
                            <Col offset={1} span={11}>
                                <Space>
                                    <div>
                                        <Form schema={this.state.appInfo.schemaObj} validator={myValidator} onSubmit={this.onSubmit} uiSchema={this.UISchema} formData={this.state.formData} widgets={widgets} templates={{ FieldTemplate: this.CustomFieldTemplate }} />
                                    </div>
                                </Space>
                            </Col>
                            <Col span={10} offset={1}>
                                <Input.TextArea placeholder='Log' style={{ width: "100%", height: "100%" }} readOnly value={this.GetLog()} />
                            </Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content>
                        <Row>
                            <Col offset={1} span={22}>
                                <Typography.Paragraph>
                                    <pre lang='shell'>
                                        {"# cmd\r\n"}
                                        {this.state.execResult.cmd || "/"}
                                    </pre>
                                </Typography.Paragraph>
                            </Col>
                        </Row>
                    </Layout.Content>
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
        },
    }
}


class EasyFileInput extends Component {
    constructor(props) {
        super(props)
    }

    onSelectFileButtonClick = () => {
        SelectFile(this.props.value || "", `Please select ${this.props.schema.title}`).then(this.onSelected).catch(this.onError)
    }

    onSelected = (file) => {
        /*
        data:application/octet-stream;name=schema;base64,ewogICAgIiRzY2hlbWEiOiAiaHR0cHM6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQv
        */
        this.props.onChange(file)
    }

    onError = (error) => {
    }

    onInputChange = (e, e2) => {
        this.onSelected(e.target.value);
    }

    render() {
        return (
            <Input.Group compact>
                <Input style={{ "width": "70%" }} value={this.props.value} onChange={this.onInputChange} />
                <Button style={{ "maxWidth": "30%" }} type="primary" onClick={this.onSelectFileButtonClick}>Select</Button>
            </Input.Group>
        )
    }

    /*
    static DataURLToPath = (url) => {
        if (!url) {
            return ""
        }
        //data:application/octet-stream;name=schema;base64,
        var urls = url.split(";")
        if (urls.length >= 2) {
            return urls[1].replace("name=", "")
        }
        return url
    }

    static PathToDataURL = (path) => {
        return `data:application/octet-stream;name=${file};base64,`
    }
    */
}

class MyValidator {
    constructor(refuseAdditionalProperties = false) {
        this.refuseAdditionalProperties = refuseAdditionalProperties
    }

    refuseAdditionalProperties = false

    isValid(schema, formData, rootSchema) {
        var v = localValidator.isValid(schema, formData, rootSchema)
        return v;
    }

    validateFormData(formData, schema, customValidate, transformErrors) {
        var data = localValidator.validateFormData(formData, schema, customValidate, transformErrors)

        var newData = {
            errors: [],
            errSchema: {}
        }

        if (data.errors.length > 0) {
            for (var i = 0; i < data.errors.length; i++) {
                const v = data.errors[i];
                if (v.name == "format" && v.params["format"] == "data-url") {
                    // shield data-url error
                } else if (v.name == "additionalProperties") {
                    if (this.refuseAdditionalProperties) {
                        newData.errors.push(v)
                    }
                } else {
                    newData.errors.push(v)
                    var property = v.property.substring(1)
                    newData.errSchema[property] = data.errorSchema[property]
                }
            }
        }

        console.log(newData)

        return newData;
    }

    toErrorList(errSchema, filedPath) {
        var res = localValidator.toErrorList(errSchema, filedPath)
    }

    rawValidation(schema, formData) {
        var res = localValidator.rawValidation(schema, formData)
        return res
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