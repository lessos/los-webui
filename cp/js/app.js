var inCpApp = {
    instDef: {
        kind: "App",
        meta: {
            id: "",
            name: "",
        },
        spec: {
            meta: {
                id: null,
                name: null,
                version: null,
            },
        },
        operate: {
            pod_id: null,
            options: [],
            action: 1 << 1,
            res_bound_roles: [],
        },
    },
    instBoundPodDef: {
        meta: {
            id: null,
        },
        spec: {},
    },
    instSet: {},
    instDeployActive: null,
    list_options: {},
    listActives: null,
};

inCpApp.Index = function () {
    var divstr =
        "<div id='incp-module-navbar'>\
  <ul id='incp-module-navbar-menus' class='incp-module-nav'>\
    <li><a class='valueui-nav-item' href='#app/inst/list'>App Instances</a></li>\
    <li><a class='valueui-nav-item' href='#app/spec/list'>AppSpec Center</a></li>\
  </ul>\
  <ul id='incp-module-navbar-optools' class='incp-module-nav incp-nav-right'></ul>\
</div>\
<div id='work-content'></div>";

    $("#comp-content").html(divstr);

    valueui.url.eventClean("incp-module-navbar-menus");
    valueui.url.eventRegister("app/inst/list", inCpApp.InstListRefresh, "incp-module-navbar-menus");
    valueui.url.eventRegister("app/spec/list", inCpAppSpec.ListRefresh, "incp-module-navbar-menus");

    inCpApp.list_options = {};
    valueui.url.eventHandler("app/inst/list", true);
};

inCpApp.InstLaunchNew = function () {
    valueui.url.eventHandler("app/spec/list");
};

inCpApp.InstListRefresh = function (options) {
    var uri = "?";
    if (document.getElementById("qry_text")) {
        uri += "qry_text=" + $("#qry_text").val();
    }
    uri +=
        "&fields=meta/id|name|user|updated,spec/meta/id|name|version,operate/action|pod_id,operate/options/name";

    var alert_id = "#incp-appls-alert";

    if (options && typeof options === "string") {
        options = {};
    }

    if (options) {
        inCpApp.list_options = options;
    } else {
        options = inCpApp.list_options;
    }
    if (!options.ops_mode) {
        // inCp.ModuleNavbarMenu("cp/app/list", inCpApp.list_nav_menus, "app/list");
    } else {
        uri += "&filter_meta_user=all";
    }

    var ep = valueui.newEventProxy("tpl", "data", function (tpl, rsj) {
        if (tpl) {
            $("#work-content").html(tpl);
        }

        if (options.ops_mode) {
            inCp.OpToolsClean();
        } else {
            inCp.OpToolsRefresh("#incp-appls-optools");
        }

        if (!rsj || rsj.kind != "AppList" || !rsj.items || rsj.items.length < 1) {
            return valueui.alert.innerShow(alert_id, "alert-info", "Item Not Found");
        }
        $(alert_id).css({
            display: "node",
        });

        options.owner_column = false;

        for (var i in rsj.items) {
            if (
                options.owner_column === false &&
                rsj.items[i].meta.user != inCp.UserSession.username
            ) {
                options.owner_column = true;
            }
            if (!rsj.items[i].operate.pod_id || rsj.items[i].operate.pod_id.length < 8) {
                rsj.items[i].operate.pod_id = "-";
            }
            if (!rsj.items[i].operate.options) {
                rsj.items[i].operate.options = [];
            }
            if (!rsj.items[i].operate.action) {
                rsj.items[i].operate.action = inCp.OpActionStop;
            }
        }
        inCpApp.listActives = rsj;

        valueui.template.render({
            dstid: "incp-appls",
            tplid: "incp-appls-tpl",
            data: {
                items: rsj.items,
                _actions: inCp.OpActions,
                _options: options,
            },
        });
    });

    ep.fail(function (err) {
        // TODO
        alert("SpecListRefresh error, Please try again later (EC:app-speclist)");
    });

    // template
    var el = document.getElementById("incp-appls");
    if (!el || el.length < 1) {
        inCp.TplFetch("app/inst/list", {
            callback: function (err, tpl) {
                if (err) {
                    return ep.emit("error", err);
                }

                ep.emit("tpl", tpl);
            },
        });
    } else {
        ep.emit("tpl", null);
    }

    inCp.TplFetch("app/inst/list", {
        callback: ep.done("tpl"),
    });

    inCp.ApiCmd("app/list" + uri, {
        callback: ep.done("data"),
    });
};

/*
inCpApp.InstListOpActionChange = function(app_id, obj, tplid) {
    if (!app_id) {
        return;
    }
    var op_action = parseInt($(obj).val());
    if (op_action < 1) {
        return;
    }

    if (!tplid) {
        tplid = "incp-appls";
    }
    var alert_id = "#" + tplid + "-alert";

    var uri = "?app_id=" + app_id + "&op_action=" + op_action;

    inCp.ApiCmd("app/op-action-set" + uri, {
        method: "GET",
        timeout: 10000,
        callback: function(err, rsj) {

            if (err) {
                return valueui.alert.innerShow(alert_id, 'error', "Failed: " + err);
            }

            if (!rsj || rsj.kind != "App") {
                var msg = "Bad Request";
                if (rsj.error) {
                    msg = rsj.error.message;
                }
                valueui.alert.innerShow(alert_id, 'error', msg);
                return;
            }

            if (op_action == 2) {
                $(obj).addClass("button-success");
            } else {
                $(obj).removeClass("button-success");
            }

            valueui.alert.innerShow(alert_id, 'ok', "Successful updated");
        }
    });
}
*/

inCpApp.OpOptInfo = function (app_id) {
    var alert_id = "#incp-appinst-opopt-info-alert";

    var ep = valueui.newEventProxy("tpl", "data", function (tpl, rsj) {
        if (!rsj || rsj.kind != "App") {
            return valueui.alert.innerShow(alert_id, "alert-info", "Item Not Found");
        }

        if (!rsj.operate.options) {
            rsj.operate.options = [];
        }

        valueui.modal.open({
            title: "App Options",
            width: 1600,
            height: 1000,
            tplsrc: tpl,
            data: rsj,
            callback: function (err, data) {
                for (var i in rsj.operate.options) {
                    var opt = rsj.operate.options[i];
                    for (var j in opt.items) {
                        var type = opt.items[j].type;

                        if (type && type >= 300 && type <= 399) {
                            var value = opt.items[j].value;
                            var fnType = inCpAppSpec.CfgFieldTypeFetch(type);

                            var textRows = 4;
                            if (value && value.length > 10) {
                                var arr = value.match(/\n/g);
                                if (arr) {
                                    textRows = arr.length + 2;
                                }
                                if (textRows < 4) {
                                    textRows = 4;
                                } else if (textRows > 50) {
                                    textRows = 50;
                                }
                            }

                            if (fnType && fnType.lang) {
                                inCp.CodeEditor(
                                    "op_fn_" + opt.name + "_" + opt.items[j].name,
                                    fnType.lang,
                                    {
                                        numberLines: textRows,
                                        readOnly: true,
                                    }
                                );
                            }
                        }
                    }
                }
            },
            buttons: [
                {
                    onclick: "valueui.modal.close()",
                    title: "Close",
                },
            ],
        });
    });

    ep.fail(function (err) {
        // TODO
        alert("SpecListRefresh error, Please try again later (EC:app-speclist)");
    });

    inCp.TplFetch("app/inst/op.opt.info", {
        callback: ep.done("tpl"),
    });

    inCp.ApiCmd("app/entry?id=" + app_id, {
        callback: ep.done("data"),
    });
};

inCpApp.instConfiguratorCallback = null;

inCpApp.instConfigurator = function (cb) {
    if (cb && typeof cb === "function" && !inCpApp.instConfiguratorCallback) {
        inCpApp.instConfiguratorCallback = cb;
    }

    if (!inCpApp.instConfiguratorCallback) {
        return;
    }

    if (!inCpApp.instDeployActive) {
        return inCpApp.instConfiguratorCallback();
    }

    if (!inCpApp.instDeployActive.spec.depends) {
        inCpApp.instDeployActive.spec.depends = [];
    }

    for (var i in inCpApp.instDeployActive.spec.depends) {
        if (inCpApp.instDeployActive.spec.depends[i]._setid) {
            continue;
        }
        inCpApp.instDeployActive.spec.depends[i]._setid =
            inCpApp.instDeployActive.spec.depends[i].id;

        var url = "app-spec/entry?id=" + inCpApp.instDeployActive.spec.depends[i].id;
        url += "&version=" + inCpApp.instDeployActive.spec.depends[i].version;

        return inCp.ApiCmd(url, {
            callback: function (err, data) {
                if (err) {
                    return alert(err); // TODO
                }
                if (data.error) {
                    return valueui.alert.open("error", data.error.message);
                }
                if (data && data.meta.id == inCpApp.instDeployActive.spec.depends[i].id) {
                    return inCpApp.instConfiguratorEntry(data.configurator, data.meta.id);
                }
            },
        });
    }

    if (
        inCpApp.instDeployActive.spec.dep_remotes &&
        inCpApp.instDeployActive.spec.dep_remotes.length > 0 &&
        !inCpApp.instDeployActive.spec.dep_remotes_setid
    ) {
        inCpApp.instDeployActive.spec.dep_remotes_setid = inCpApp.instDeployActive.spec.meta.id;
        return inCpApp.instConfigDepRemotes(inCpApp.instDeployActive.spec.meta.id);
    }

    if (
        inCpApp.instDeployActive.spec.configurator &&
        !inCpApp.instDeployActive.spec.configurator._setid
    ) {
        inCpApp.instDeployActive.spec.configurator._setid = inCpApp.instDeployActive.spec.meta.id;
        return inCpApp.instConfiguratorEntry(
            inCpApp.instDeployActive.spec.configurator,
            inCpApp.instDeployActive.spec.meta.id
        );
    }

    for (var i in inCpApp.instDeployActive.spec.depends) {
        inCpApp.instDeployActive.spec.depends[i]._setid = null;
    }
    if (inCpApp.instDeployActive.spec.configurator) {
        inCpApp.instDeployActive.spec.configurator._setid = null;
    }

    inCpApp.instConfiguratorCallback();

    inCpApp.instDeployActive = null;
    inCpApp.instConfiguratorCallback = null;
};

inCpApp.instConfigDepRemotesActive = null;
inCpApp.instConfigDepRemotesBinds = null;

inCpApp.instConfigDepRemotes = function (spec_id) {
    if (!inCpApp.instDeployActive.operate.services) {
        inCpApp.instDeployActive.operate.services = [];
    }
    if (!inCpApp.instDeployActive.operate.options) {
        inCpApp.instDeployActive.operate.options = [];
    }

    inCpApp.instConfigDepRemotesActive = spec_id;

    var depRemotes = inCpApp.instDeployActive.spec.dep_remotes;

    for (var i in inCpApp.instDeployActive.operate.services) {
        if (!inCpApp.instDeployActive.operate.services[i].app_id) {
            continue;
        }
        for (var j in depRemotes) {
            if (!depRemotes[j]._binds) {
                depRemotes[j]._binds = [];
            }
            if (depRemotes[j].id == inCpApp.instDeployActive.operate.services[i].spec) {
                depRemotes[j]._binds.push({
                    app_id: inCpApp.instDeployActive.operate.services[i].app_id,
                    pod_id: inCpApp.instDeployActive.operate.services[i].pod_id,
                    hash_id: valueui.utilx.cryptoMd5(
                        depRemotes[j].id + ":" + inCpApp.instDeployActive.operate.services[i].app_id
                    ),
                });
            }
        }
    }

    for (var i in inCpApp.instDeployActive.operate.options) {
        if (!inCpApp.instDeployActive.operate.options[i].ref) {
            continue;
        }
        for (var j in depRemotes) {
            if (!depRemotes[j]._binds) {
                depRemotes[j]._binds = [];
            }
            if (depRemotes[j].id != inCpApp.instDeployActive.operate.options[i].ref.spec_id) {
                continue;
            }
            var hit = false;
            for (var k in depRemotes[j]._binds) {
                if (
                    depRemotes[j]._binds[k].app_id ==
                    inCpApp.instDeployActive.operate.options[i].ref.app_id
                ) {
                    hit = true;
                    break;
                }
            }
            if (hit) {
                continue;
            }
            depRemotes[j]._binds.push({
                app_id: inCpApp.instDeployActive.operate.options[i].ref.app_id,
                pod_id: inCpApp.instDeployActive.operate.options[i].ref.pod_id,
                hash_id: valueui.utilx.cryptoMd5(
                    depRemotes[j].id + ":" + inCpApp.instDeployActive.operate.options[i].ref.app_id
                ),
            });
        }
    }

    inCpApp.instConfigDepRemotesBinds = valueui.utilx.objectClone(depRemotes);

    valueui.modal.open({
        id: "incp-appinst-cfgwizard-depremotes",
        title: "App Configuration Wizard with remote depends",
        width: 1600,
        height: 800,
        tpluri: inCp.TplPath("app/inst/cfg-wizard-depremotes"),
        callback: function (err, data) {
            valueui.template.render({
                dstid: "incp-appinst-cfg-wizard-depremotes",
                tplid: "incp-appinst-cfg-wizard-depremotes-tpl",
                data: {
                    dep_remotes: depRemotes,
                },
            });
        },
        buttons: [
            {
                onclick: "valueui.modal.close()",
                title: "Close",
            },
            {
                onclick: "inCpApp.instConfigDepRemotesCommit()",
                title: "Next",
                style: "btn-primary",
            },
        ],
    });
};

inCpApp.InstConfigDepRemoteSelect = function (spec_id) {
    if (!spec_id) {
        return;
    }

    inCpApp.InstConfigWizardAppBound(spec_id, function (err, select_item) {
        for (var i in inCpApp.instConfigDepRemotesBinds) {
            if (inCpApp.instConfigDepRemotesBinds[i].id != spec_id) {
                continue;
            }
            if (!inCpApp.instConfigDepRemotesBinds[i]._binds) {
                inCpApp.instConfigDepRemotesBinds[i]._binds = [];
            }
            for (var j in inCpApp.instConfigDepRemotesBinds[i]._binds) {
                if (inCpApp.instConfigDepRemotesBinds[i]._binds[j].app_id == select_item) {
                    return;
                }
            }
            inCpApp.instConfigDepRemotesBinds[i]._binds.push({
                app_id: select_item,
                spec_id: spec_id,
            });
        }

        valueui.template.render({
            append: true,
            dstid: "incp-appinst-cfg-wizard-depremotes-binds-" + spec_id,
            tplid: "incp-appinst-cfg-wizard-depremotes-binds-item-tpl",
            data: {
                spec_id: spec_id,
                app_id: select_item,
                pod_id: "new selected",
                hash_id: valueui.utilx.cryptoMd5(spec_id + ":" + select_item),
            },
        });
    });
};

inCpApp.instConfigDepRemoteDel = function (field, spec_id, app_id) {
    if (!inCpApp.instConfigDepRemotesActive) {
        return;
    }

    $(field).parent().parent().remove();

    for (var i in inCpApp.instConfigDepRemotesBinds) {
        if (
            inCpApp.instConfigDepRemotesBinds[i].id != spec_id ||
            !inCpApp.instConfigDepRemotesBinds[i]._binds
        ) {
            continue;
        }
        for (var j in inCpApp.instConfigDepRemotesBinds[i]._binds) {
            if (inCpApp.instConfigDepRemotesBinds[i]._binds[j].app_id == app_id) {
                inCpApp.instConfigDepRemotesBinds[i]._binds[j].delete = true;
                break;
            }
        }
        break;
    }
};

inCpApp.instConfigDepRemotesCommit = function () {
    if (!inCpApp.instConfigDepRemotesActive) {
        return;
    }

    var alert_id = "#incp-appinst-cfg-wizard-depremotes-alert";
    var form = $("#incp-appinst-cfg-wizard-depremotes");
    if (!form) {
        return;
    }

    var req = {
        id: inCpApp.instDeployActive.meta.id,
        dep_remotes: [],
    };

    try {
        if (inCpApp.instConfigDepRemotesActive == inCpApp.instDeployActive.spec.meta.id) {
            for (var i in inCpApp.instConfigDepRemotesBinds) {
                if (!inCpApp.instConfigDepRemotesBinds[i]._binds) {
                    continue;
                }
                for (var j in inCpApp.instConfigDepRemotesBinds[i]._binds) {
                    req.dep_remotes.push({
                        spec_id: inCpApp.instConfigDepRemotesBinds[i].id,
                        app_id: inCpApp.instConfigDepRemotesBinds[i]._binds[j].app_id,
                        delete: inCpApp.instConfigDepRemotesBinds[i]._binds[j].delete,
                    });
                }
            }
        }
    } catch (err) {
        return valueui.alert.innerShow(alert_id, "error", err);
    }

    inCp.ApiCmd("app/config-rep-remotes", {
        method: "POST",
        data: JSON.stringify(req),
        callback: function (err, rsj) {
            var errMsg = valueui.utilx.errorKindCheck(err, rsj, "AppInstConfig");
            if (errMsg) {
                return valueui.alert.innerShow(alert_id, "error", errMsg);
            }

            valueui.alert.innerShow(alert_id, "ok", "Successfully Updated");

            window.setTimeout(function () {
                valueui.alert.innerShow(alert_id, "");
                if (inCpApp.instConfiguratorCallback) {
                    inCpApp.instConfigurator();
                }
            }, 300);
        },
    });
};

inCpApp.instConfiguratorEntryActive = null;
inCpApp.instConfiguratorEntry = function (configurator, spec_id) {
    if (configurator && configurator.fields && configurator.fields.length > 0) {
        inCpApp.instConfiguratorEntryActive = configurator;
        inCpApp.instConfiguratorEntryActive.spec_id = spec_id;

        if (!inCpApp.instDeployActive.operate.options) {
            inCpApp.instDeployActive.operate.options = [];
        }
        var option = null;
        for (var i in inCpApp.instDeployActive.operate.options) {
            if (inCpApp.instDeployActive.operate.options[i].name == configurator.name) {
                option = inCpApp.instDeployActive.operate.options[i];
            }
        }
        if (!option) {
            option = {
                name: configurator.name,
                items: [],
            };
        } else if (!option.items) {
            option.items = [];
        }

        var editors = [];
        for (var i in configurator.fields) {
            var type = configurator.fields[i].type;
            var name = configurator.fields[i].name;
            var auto_fill = configurator.fields[i].auto_fill;
            var value = null;
            var textRows = 4;

            for (var j in option.items) {
                if (option.items[j].name == name) {
                    value = option.items[j].value;
                    break;
                }
            }

            if (!value) {
                if (configurator.fields[i].default) {
                    value = configurator.fields[i].default;
                }
            }
            var readOnly = false;
            if (auto_fill) {
                readOnly = true;
            }

            if (!value && auto_fill) {
                for (var j in inCpAppSpec.cfgFieldAutoFills) {
                    if (inCpAppSpec.cfgFieldAutoFills[j].type == auto_fill) {
                        value = inCpAppSpec.cfgFieldAutoFills[j].title;
                        break;
                    }
                }
            }
            if (!value) {
                value = "";
            }

            var fnType = inCpAppSpec.CfgFieldTypeFetch(type);

            if (fnType && type >= 300 && type <= 399) {
                if (value.length > 10) {
                    var arr = value.match(/\n/g);
                    if (arr) {
                        textRows = arr.length + 2;
                    }
                    if (textRows < 4) {
                        textRows = 4;
                    } else if (textRows > 20) {
                        textRows = 20;
                    }
                }
                editors.push({
                    name: name,
                    lang: fnType.lang,
                    line: textRows,
                    readOnly: readOnly,
                });
                configurator.fields[i]._textRows = textRows;
                configurator.fields[i]._readOnly = readOnly;
                configurator.fields[i]._editor = true;
            }

            configurator.fields[i]._value = value;
        }

        /**
        var depRemotes = [];
        if (spec_id == inCpApp.instDeployActive.spec.meta.id) {
            depRemotes = inCpApp.instDeployActive.spec.dep_remotes;
            for (var i in inCpApp.instDeployActive.operate.options) {
                if (!inCpApp.instDeployActive.operate.options[i].ref) {
                    continue;
                }
                for (var j in depRemotes) {
                    if (depRemotes[j].id == inCpApp.instDeployActive.operate.options[i].ref.spec_id) {
                        depRemotes[j]._app_id = inCpApp.instDeployActive.operate.options[i].ref.app_id;
                        break;
                    }
                }
            }
        }
        */

        valueui.modal.open({
            id: "incp-appinst-cfgwizard",
            title: "App Configuration Wizard : " + configurator.name,
            width: 1600,
            height: 800,
            tpluri: inCp.TplPath("app/inst/cfg-wizard"),
            callback: function (err, data) {
                valueui.template.render({
                    dstid: "incp-appinst-cfg-wizard",
                    tplid: "incp-appinst-cfg-wizard-tpl",
                    data: {
                        name: configurator.name,
                        fields: configurator.fields,
                        // dep_remotes: depRemotes,
                    },
                    callback: function () {
                        for (var i in editors) {
                            var c = editors[i];
                            inCp.CodeEditor("fn_" + c.name, c.lang, {
                                readOnly: c.readOnly,
                                numberLines: c.line,
                            });
                        }
                    },
                });
            },
            buttons: [
                {
                    onclick: "valueui.modal.close()",
                    title: "Close",
                },
                {
                    onclick: "inCpApp.instConfigCommit()",
                    title: "Next",
                    style: "btn-primary",
                },
            ],
        });
    } else {
        inCpApp.instConfigurator();
    }
};

inCpApp.InstConfigWizardAppBound = function (spec_id, cb) {
    var alert_id = "#incp-appinst-cfg-wizard-alert";

    var ep = valueui.newEventProxy("tpl", "data", function (tpl, data) {
        var errMsg = valueui.utilx.errorKindCheck(null, data, "AppList");
        if (errMsg) {
            return;
        }

        if (!data.items || data.items.length < 1) {
            return valueui.alert.innerShow(
                alert_id,
                "error",
                "No Fit AppSpec (" + spec_id + ") AppInstance Found"
            );
        }

        valueui.modal.open({
            id: "incp-appinst-cfgbound-selector",
            title: "App Instances",
            tplsrc: tpl,
            data: data,
            backEnable: true,
            buttons: [
                {
                    onclick: "valueui.modal.close()",
                    title: "Close",
                },
            ],
            fn_selector: function (err, select_item) {
                if (cb) {
                    cb(err, select_item);
                    return valueui.modal.prev();
                }
                $("#incp-appinst-cfgfield-" + spec_id).val(select_item);
                $("#incp-appinst-cfgfield-" + spec_id + "-dp").text(select_item);

                valueui.modal.prev();
            },
            callback: function (err, data) {
                valueui.template.render({
                    dstid: "incp-appls-selector",
                    tplid: "incp-appls-selector-tpl",
                    data: data,
                });
            },
        });
    });

    ep.fail(function (err) {
        alert("error, Please try again later (EC:incp-app-cfg)");
    });

    inCp.TplFetch("app/inst/selector", {
        callback: ep.done("tpl"),
    });

    inCp.ApiCmd("app/list?spec_id=" + spec_id, {
        callback: ep.done("data"),
    });
};

inCpApp.instConfigCommit = function () {
    if (!inCpApp.instConfiguratorEntryActive) {
        return;
    }

    var alert_id = "#incp-appinst-cfg-wizard-alert";
    var form = $("#incp-appinst-cfg-wizard");
    if (!form) {
        return;
    }

    var req = {
        id: inCpApp.instDeployActive.meta.id,
        option: {
            name: inCpApp.instConfiguratorEntryActive.name,
            items: [],
        },
        // dep_remotes: [],
    };

    try {
        for (var i in inCpApp.instConfiguratorEntryActive.fields) {
            var field = inCpApp.instConfiguratorEntryActive.fields[i];
            var value = null;

            if (field.type >= 300 && field.type <= 399) {
                if (field._editor) {
                    value = inCp.CodeEditorValue("fn_" + field.name);
                } else {
                    value = form.find("textarea[name=fn_" + field.name + "]").val();
                }
            } else {
                switch (field.type) {
                    case 1:
                        value = form.find("input[name=fn_" + field.name + "]").val();
                        break;

                    case 10:
                        value = form.find("input[name=fn_" + field.name + "]").val();
                        break;
                }
            }

            if (value) {
                req.option.items.push({
                    name: field.name,
                    value: value,
                });
            }
        }

        /**
        if (inCpApp.instConfiguratorEntryActive.spec_id == inCpApp.instDeployActive.spec.meta.id) {

            for (var i in inCpApp.instDeployActive.spec.dep_remotes) {

                var field = inCpApp.instDeployActive.spec.dep_remotes[i];
                var value = form.find("input[name=fn_" + field.id + "]").val();

                if (value) {
                    req.dep_remotes.push({
                        spec_id: field.id,
                        app_id: value,
                    });
                }
            }
        }
        */
    } catch (err) {
        return valueui.alert.innerShow(alert_id, "error", err);
    }

    if (
        inCpApp.instConfiguratorEntryActive.spec_id &&
        inCpApp.instConfiguratorEntryActive.spec_id.length > 8
    ) {
        req.spec_id = inCpApp.instConfiguratorEntryActive.spec_id;
    }

    inCp.ApiCmd("app/config", {
        method: "POST",
        data: JSON.stringify(req),
        callback: function (err, rsj) {
            var errMsg = valueui.utilx.errorKindCheck(err, rsj, "AppInstConfig");
            if (errMsg) {
                return valueui.alert.innerShow(alert_id, "error", errMsg);
            }

            valueui.alert.innerShow(alert_id, "ok", "Successfully Updated");

            window.setTimeout(function () {
                valueui.alert.innerShow(alert_id, "");
                valueui.modal.close(function () {
                    if (inCpApp.instConfiguratorCallback) {
                        inCpApp.instConfigurator();
                    }
                });
            }, 300);
        },
    });
};

var inCpAppInstDeployActivePod = null;
inCpApp.InstDeploy = function (id, auto_start) {
    var tplid = "incp-appls";
    var alert_id = "#" + tplid + "-alert";

    inCp.ApiCmd("app/entry?id=" + id, {
        timeout: 3000,
        callback: function (err, rsj) {
            var errMsg = valueui.utilx.errorKindCheck(err, rsj, "App");
            if (errMsg) {
                return valueui.alert.innerShow(alert_id, "error", errMsg);
            }

            inCpApp.instDeployActive = rsj;
            inCpAppInstDeployActivePod = rsj.operate.pod_id;

            inCpApp.instConfiguratorCallback = null;
            inCpApp.instConfigurator(function () {
                inCpApp.InstDeployCommit(id, auto_start);
            });
        },
    });
};

inCpApp.InstDeployCommit = function (app_id, auto_start) {
    var tplid = "incp-appls";
    var alert_id = "#" + tplid + "-alert";

    var uri = "?app_id=" + app_id;
    if (auto_start && auto_start === true) {
        uri += "&operate_action=start";
    }

    inCp.ApiCmd("pod/app-sync" + uri, {
        method: "GET",
        timeout: 10000,
        callback: function (err, rsj) {
            var errMsg = valueui.utilx.errorKindCheck(err, rsj, "App");
            if (errMsg) {
                return valueui.alert.innerShow(alert_id, "error", errMsg);
            }

            inCpApp.instDeployActive = null;

            valueui.modal.close(function () {
                var msg = valueui.lang.T(
                    "Successfully deployed Application to Container (ID: %s)",
                    inCpAppInstDeployActivePod
                );

                valueui.modal.open({
                    title: "Deployment",
                    width: 600,
                    height: 200,
                    tplsrc: "<div class='alert alert-success'>" + msg + "</div>",
                    buttons: [
                        {
                            onclick: "valueui.modal.close()",
                            title: "Close",
                        },
                        {
                            onclick: `inCpApp.InstPodEntryIndex('${inCpAppInstDeployActivePod}')`,
                            title: "Go to Container Details",
                            style: "btn btn-primary",
                        },
                    ],
                });
            });
        },
    });
};

inCpApp.InstNew = function (spec_id, version) {
    if (!spec_id || spec_id.length < 4) {
        return alert("AppSpec error, Please try again later (EC:incp-appset)");
    }

    var ep = valueui.newEventProxy("tpl", "spec", function (tpl, spec) {
        var errMsg = valueui.utilx.errorKindCheck(null, spec, "AppSpec");
        if (errMsg) {
            return alert(errMsg);
        }

        inCpApp.instSet = valueui.utilx.objectClone(inCpApp.instDef);

        spec.exp_res._cpu_min = (spec.exp_res.cpu_min / 10).toFixed(1);
        inCpApp.instSet.spec = spec;

        if (version) {
            inCpApp.instSet.spec.meta.version = version;
        }

        inCpApp.instSet.spec.runtime_images = inCpApp.instSet.spec.runtime_images || [];

        valueui.modal.open({
            title: "Create new App Instance",
            width: 1000,
            height: 500,
            tplsrc: tpl,
            data: inCpApp.instSet,
            callback: function (err, data) {},
            buttons: [
                {
                    onclick: "valueui.modal.close()",
                    title: "Close",
                },
                {
                    onclick: "inCpApp.InstNewPodSelect()",
                    title: "Next",
                    style: "btn-primary",
                },
            ],
        });
    });

    ep.fail(function (err) {
        alert("SpecSet error, Please try again later (EC:incp-appset)");
    });

    // template
    inCp.TplFetch("app/inst/new.info.p5", {
        callback: ep.done("tpl"),
    });

    // spec
    if (!spec_id) {
        ep.emit("spec", null);
    } else {
        inCp.ApiCmd("app-spec/entry/?id=" + spec_id, {
            callback: ep.done("spec"),
        });
    }
};

inCpApp.instNewPodSelectCallback = function (err, pod_id) {
    inCp.ApiCmd("pod/entry?id=" + pod_id, {
        callback: function (err, podjs) {
            var errMsg = valueui.utilx.errorKindCheck(err, podjs, "Pod");
            if (errMsg) {
                return alert(errMsg);
            }

            inCpApp.instSet.operate.pod_id = podjs.meta.id;
            inCpApp.instSet._operate_pod = podjs;

            inCpApp.InstNewConfirm();
        },
    });
};

inCpApp.InstNewPodSelect = function () {
    var alert_id = "#incp-appnew-alert";

    var name = $("#incp-appnew-form").find("input[name='name']").val();
    if (!name) {
        return valueui.alert.innerShow(alert_id, "error", "Spec Name Not Found");
    }

    inCpApp.instSet.meta.name = name;

    valueui.modal.open({
        id: "incp-appnew-oppod",
        title: "Bind App to Pod", // Select a Pod to Bound",
        width: 900,
        height: 500,
        tpluri: inCp.TplPath("pod/inst-selector"),
        backEnable: true,
        callback: function () {
            inCpPod.List("incp-podls-selector", {
                operate_action: inCp.OpActionStart,
                exp_filter_app_notin: inCpApp.instSet.spec.meta.id,
                exp_filter_app_spec_id: inCpApp.instSet.spec.meta.id,
                new_options: {
                    open_modal: true,
                    app_cpu_min: (inCpApp.instSet.spec.exp_res.cpu_min / 10).toFixed(1),
                    app_mem_min: inCpApp.instSet.spec.exp_res.mem_min,
                    app_vol_min: inCpApp.instSet.spec.exp_res.vol_min,
                    app_new_callback: inCpApp.instNewPodSelectCallback,
                    app_spec_id: inCpApp.instSet.spec.meta.id,
                    app_runtime_images: inCpApp.instSet.spec.runtime_images,
                },
            });
        },
        fn_selector: inCpApp.instNewPodSelectCallback,
        buttons: [
            {
                onclick: "valueui.modal.close()",
                title: "Close",
            },
        ],
    });
};

inCpApp.InstNewConfirm = function () {
    valueui.modal.open({
        id: "incp-appnew-confirm",
        title: "Confirm",
        width: 900,
        height: 400,
        tpluri: inCp.TplPath("app/inst/new.confirm.p5"),
        data: inCpApp.instSet,
        backEnable: true,
        buttons: [
            {
                onclick: "valueui.modal.close()",
                title: "Close",
            },
            {
                onclick: "inCpApp.InstNewCommit()",
                title: "Confirm and Save",
                style: "btn-primary",
            },
        ],
    });
};

inCpApp.InstNewCommit = function () {
    inCp.ApiCmd("app/set", {
        method: "POST",
        data: JSON.stringify(inCpApp.instSet),
        timeout: 3000,
        callback: function (err, rsj) {
            var alert_id = "#incp-appnew-cf-alert";
            var errMsg = valueui.utilx.errorKindCheck(err, rsj, "App");
            if (errMsg) {
                return valueui.alert.innerShow(alert_id, "error", errMsg);
            }

            valueui.alert.innerShow(alert_id, "ok", "Successful operation");

            inCpApp.instSet = {};
            valueui.url.eventHandler("app/inst/list");

            window.setTimeout(function () {
                if (rsj.meta && rsj.meta.id) {
                    inCpApp.InstDeploy(rsj.meta.id, true);
                } else {
                    valueui.modal.close();
                }
            }, 1000);
        },
    });
};

inCpApp.InstSet = function (app_id, spec_id) {
    if (!app_id) {
        return alert("No AppID Found");
    }

    inCpApp.instSet = {};
    var spec_version = "";

    if (inCpApp.listActives && inCpApp.listActives.items) {
        for (var i in inCpApp.listActives.items) {
            if (inCpApp.listActives.items[i].meta.id == app_id) {
                inCpApp.instSet = inCpApp.listActives.items[i];
                if (spec_id == inCpApp.instSet.spec.meta.id) {
                    spec_version = inCpApp.instSet.spec.meta.version;
                }
                break;
            }
        }
    }

    var ep = valueui.newEventProxy(
        "tpl",
        "inst",
        "roles",
        "spec_vs",
        function (tpl, inst, roles, spec_vs) {
            var errMsg = valueui.utilx.errorKindCheck(null, inst, "App");
            if (errMsg) {
                return valueui.alert.open("error", errMsg);
            }

            errMsg = valueui.utilx.errorKindCheck(null, roles, "UserRoleList");
            if (errMsg) {
                return valueui.alert.open("error", errMsg);
            }

            $("#work-content").html(tpl);

            if (!inst.operate) {
                inst.operate = {};
            }
            if (!inst.operate.res_bound_roles) {
                inst.operate.res_bound_roles = [];
            }
            inst.operate._res_bound_roles = valueui.utilx.objectClone(roles);
            for (var i in inst.operate.res_bound_roles) {
                for (var j in inst.operate._res_bound_roles.items) {
                    if (
                        inst.operate.res_bound_roles[i] == inst.operate._res_bound_roles.items[j].id
                    ) {
                        inst.operate._res_bound_roles.items[j]._checked = true;
                        break;
                    }
                }
            }
            if (!inst.operate.action) {
                inst.operate.action = inCp.OpActionStop;
            }

            inCpApp.instSet = inst;
            inCpApp.instSet._op_actions = inCp.OpActions;

            if (spec_vs && spec_vs.items && spec_vs.items.length > 0) {
                var hit = false;
                for (var i in spec_vs.items) {
                    if (spec_vs.items[i].version == inst.spec.meta.version) {
                        hit = true;
                        break;
                    }
                }
                if (!hit) {
                    spec_vs.items.push({
                        version: inst.spec.meta.version,
                        created: inst.spec.meta.updated,
                        comment: "",
                    });
                }
                inCpApp.instSet._spec_vs = spec_vs.items;
            }

            valueui.template.render({
                dstid: "incp-appset",
                tplid: "incp-appset-tpl",
                data: inCpApp.instSet,
            });
        }
    );

    ep.fail(function (err) {
        // TODO
        alert("SpecSet error, Please try again later (EC:incp-appset)");
    });

    // template
    inCp.TplFetch("app/inst/set", {
        callback: ep.done("tpl"),
    });

    valueui.utilx.ajax(inCp.base + "auth/app-role-list", {
        callback: ep.done("roles"),
    });

    if (spec_id) {
        inCp.ApiCmd("app-spec/version-list?id=" + spec_id + "&version=" + spec_version, {
            callback: ep.done("spec_vs"),
        });
    } else {
        ep.emit("spec_vs", null);
    }

    // data
    inCp.ApiCmd("app/entry/?id=" + app_id, {
        callback: ep.done("inst"),
    });
};

inCpApp.InstSetCommit = function (options) {
    options = options || {};

    var alert_id = "#incp-appset-alert";
    try {
        var form = $("#incp-appset");
        if (!form) {
            throw "No Form Data Found";
        }

        inCpApp.instSet.meta.name = form.find("input[name=name]").val();

        inCpApp.instSet.operate.res_bound_roles = [];
        form.find("input[name=res_bound_roles]:checked").each(function () {
            var val = parseInt($(this).val());
            if (val > 1) {
                inCpApp.instSet.operate.res_bound_roles.push(val);
            }
        });

        var version = form.find("#app_spec_version").val();
        if (version) {
            inCpApp.instSet.spec.meta.version = version;
        }

        inCpApp.instSet.operate.action = parseInt(form.find("input[name=op_action]:checked").val());
    } catch (err) {
        return valueui.alert.innerShow(alert_id, "error", err);
    }

    inCp.ApiCmd("app/set", {
        method: "POST",
        data: JSON.stringify(inCpApp.instSet),
        timeout: 3000,
        callback: function (err, rsj) {
            var errMsg = valueui.utilx.errorKindCheck(err, rsj, "App");
            if (errMsg) {
                return valueui.alert.innerShow(alert_id, "error", errMsg);
            }

            var msg = "Successful updated";
            if (options.deploy) {
                msg += ", Next starts the deployment ...";
            }

            valueui.alert.innerShow(alert_id, "ok", msg);

            window.setTimeout(function () {
                inCpApp.InstListRefresh();
                if (options.deploy) {
                    inCpApp.InstDeploy(inCpApp.instSet.meta.id);
                }
                inCpApp.instSet = {};
            }, 1000);
        },
    });
};

inCpApp.InstSetCommitAndDeploy = function () {
    inCpApp.InstSetCommit({
        deploy: true,
    });
};

inCpApp.InstPodInfo = function (pod_id) {
    inCpPod.Info(pod_id, {
        buttons: [
            {
                title: "Detail",
                onclick: `inCpApp.InstPodEntryIndex('${pod_id}')`,
                style: "btn-success",
            },
        ],
    });
};

inCpApp.InstPodEntryIndex = function (pod_id) {
    valueui.modal.close();
    valueui.url.eventActive("pod/index");
    inCpPod.EntryIndex(pod_id);
};
