// ==UserScript==
// @name        zyxel 1password complete
// @namespace   Violentmonkey Scripts
// @version     1.1
// @description Modify Zyxel router login page so 1Password correctly autofills it (and fix the shocking js)
// @grant       none
// @match       *://10.0.1.1/
// @require     https://code.jquery.com/jquery-3.6.1.slim.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

function containsNonLatinCodepoints(s) {
    return /[^\u0000-\u00ff]/.test(s);
}

const fixPasswordField = function () {
    'use strict';

    window.violentMonkeyPassword = '';

    var userPassword = document.getElementById('userpassword');

    if (userPassword) {
        userPassword.setAttribute('type', 'password');
    }

    //window.showSavePassword = 'false';

    YUI({}).use('node-base', 'cookie', 'gallery-base64', 'io-base', "json", function (Y) {

        Y.one('#userpassword').on("change", function (e) {
            if (!containsNonLatinCodepoints(window.passwordTmp)) {
                window.violentMonkeyPassword = window.passwordTmp;
                window.password = window.passwordTmp;
            }
        });

        // what in the actual fuck from here downwards...
        function UserLoginCheckHandle(action, userName, passwd) {
            var cgLoginObj = { "Input_Account": userName, "Input_Passwd": Y.Base64.encode(passwd) };
            var url = "/UserLoginCheck?action=" + action;
            var ret = -1;

            httpReqSendAndRecv({
                url: url,
                obj: cgLoginObj,
                action: "PUT",
                fnSuccess: function (trans, response, args) {
                    var res = Y.JSON.parse(response.responseText);
                    if (action == "check") {
                        cgPasswdIid = res[0].Iid;
                        if (typeof res[0].Authentication != "undefined") {
                            /* set cookie */
                            var Text = zyusername + ":" + res[0].Authentication;
                            encodedText = Y.Base64.encode(Text);
                            Y.log(encodedText);

                            /* get curren URL */
                            var cururl = document.URL;
                            var curaddr = cururl.split("/");

                            Y.Cookie.set("Authentication", encodedText, {
                                path: "/",          //save cookie from all pages
                                host: curaddr[2]    //IP addr that user input in browser
                            });
                            /* end set cookie */

                            if (res[0].result == "0") {
                                ret = 0;
                            }
                            else if (res[0].result == "1") {
                                if ((zyFirmwareVersion.search("ABGI") != -1) || (zyFirmwareVersion.search("ABJV") != -1)) { // 20170912 Max Add, skip change password page
                                    ret = 0;
                                } else {
                                    ret = 1;
                                }
                            }
                        }
                    }
                },
                fnFailure: function (trans, response, args) {
                    if (response.status == 400)
                        ret = -1;
                }
            });

            return ret;
        }

        function userLoginResHandle(re) {
            var searchres = re.responseText.search("Success");
            var portMirror = re.responseText.search("PortMirror");
            var lockUser = re.responseText.search("Locked User");
            var waitUser = re.responseText.search("Wait");
            var waitLockTime_string_start = [], waitLockTime_string_end = [];
            var waitLockTime = 0, waitLock_min = 0; waitLock_sec = 0;
            var show_lock_string = "This username is invalid currently.";

            var AVAIL_MULTILANG_string_start = [], AVAIL_MULTILANG_string_end = [];
            AVAIL_MULTILANG_string_start = re.responseText.split("id=\"AVAIL_MULTILANG\" value=\"");
            AVAIL_MULTILANG_string_end = AVAIL_MULTILANG_string_start[1].split("\" style=\"display:none\"><input id=\"MODEL_NAME\"");
            avail_multiLang = AVAIL_MULTILANG_string_end[0];
            if (searchres != -1 || portMirror != -1) {
                var go_chgPwd_page = UserLoginCheckHandle("check", zyusername, password);
                if (CustomerName.search("CBT") != -1) {//CBT
                    go_chgPwd_page = 0;
                }

                /* __ZyXEL__, Melissa, 20170627,Do not show change password page next time. */
                var DotShowchangePasswdHtml = false;
                if (zyWebGuiFlagObj.VMG1312T20B_Millenicom) {
                    var data_logcfggpaccount;
                    var accountnum = 0;
                    data_logcfggpaccount = httpReqSendAndRecv({ url: "/cgi-bin/login?oid=RDM_OID_ZY_LOG_CFG_GP_ACCOUNT", action: "GET" });
                    for (accountnum = 0; accountnum < data_logcfggpaccount.length; accountnum++) {
                        if (data_logcfggpaccount[accountnum].Object.Username === zyusername)
                            break;
                    }
                    DotShowchangePasswdHtml = data_logcfggpaccount[accountnum].Object.DotChangeDefPwd
                }

                /* __ZyXEL__, Melissa, 20161103, do not need changePasswdHtml (wizard costomization for Brazil) */
                if ((zyWebGuiFlagObj.VMG1312T20A_Brazil) || (zyWebGuiFlagObj.VMG1312T20A_Algar) || (zyFirmwareVersion.search("ABIV") != -1 && zyFirmwareVersion.search("_D") != -1)) {
                    UserLoginCheckHandle("add_login_entry", zyusername, password);
                    if (type == "debug") {
                        genPortMirrorHtml();
                    }
                    else {
                        genindexhtml(curLang, zyusername);
                    }
                } else {
                    UserLoginCheckHandle("add_login_entry", zyusername, password);
                    if (go_chgPwd_page == 1) {
                        Y.one("#loginPage").set("innerHTML", "");
                        changePasswdHtml(Y, LoginPageZyCustObj);
                        initalCgPasswdSetting();
                    }
                    else if (go_chgPwd_page == 0) {
                        if (type == "debug")
                            genPortMirrorHtml();
                        else
                            genindexhtml(curLang, zyusername);
                    }
                    else {
                        if (type == "debug")
                            genloginhtml(curLang, "debug");
                        else
                            genloginhtml(curLang, "normal");
                    }
                }
            }
            else if (waitUser != -1) {
                genwaithtml(curLang);
            }
            else if (lockUser != -1) {
                Y.log("not correct!!");
                Y.log("re.responseText");
                Y.log(re.responseText);
                try {
                    waitLockTime_string_start = re.responseText.split("LockTimeStart");
                    waitLockTime_string_end = waitLockTime_string_start[1].split("TimeEnd");
                    waitLockTime = parseInt(waitLockTime_string_end[0]);
                    waitLock_min = Math.floor(waitLockTime / 60);
                    waitLock_sec = waitLockTime % 60;
                } catch (e) {
                    Y.log("no waitLockTime!!");
                }
                show_lock_string = "This username is invalid currently.<br>Please retry after " + waitLock_min + " mins " + waitLock_sec + " secs."
                Y.one('#zylock').set("innerHTML", show_lock_string);
                Y.one('#zylock').removeAttribute('style');
                Y.one('#zypswd').setAttribute('style', "display:none");
                Y.one('#zyusnm').setAttribute('style', "display:none");
                Y.Cookie.remove("Authentication");
            }
            else {
                Y.log("not correct!!");
                searchres = re.responseText.search("Invalid Username");
                Y.log("re.responseText");
                Y.log(re.responseText);

                if (searchres != -1) {
                    if (Y.one('#zylock').hasAttribute('style') && Y.one('#zypswd').hasAttribute('style'))
                        Y.one('#zyusnm').removeAttribute('style');
                    else if (Y.one('#zylock').hasAttribute('style')) {
                        Y.one('#zypswd').setAttribute('style', "display:none");
                        Y.one('#zyusnm').removeAttribute('style');
                    }
                    else {
                        Y.one('#zylock').setAttribute('style', "display:none");
                        Y.one('#zyusnm').removeAttribute('style');
                    }
                }
                else {
                    if (Y.one('#zyusnm').hasAttribute('style') && Y.one('#zylock').hasAttribute('style'))
                        Y.one('#zypswd').removeAttribute('style');
                    else if (Y.one('#zyusnm').hasAttribute('style')) {
                        Y.one('#zylock').setAttribute('style', "display:none");
                        Y.one('#zypswd').removeAttribute('style');
                    }
                    else {
                        Y.one('#zyusnm').setAttribute('style', "display:none");
                        Y.one('#zypswd').removeAttribute('style');
                    }
                }
            }
        }

        Y.one('#loginBtn').on('click', function () {
            password = window.violentMonkeyPassword;
            zyusername = Y.one('#username').get('value');

            LoginPageGetCustomizationData();
            getWebGuiFlag();

            if (zyusername == "" && password == "") { //check user input is not empty
                Y.one('#zypswd').setAttribute('style', "display:none");
                Y.one('#zyusnm').removeAttribute('style');
                return;
            }

            httpReqSendAndRecv({
                sync: false,
                url: "/init",
                action: "PUT",
                obj: { "Input_Account": zyusername, "Input_Passwd": Y.Base64.encode(password) },
                fnSuccess: function (trans, response, args) {
                    userLoginResHandle(response);
                },
                fnFailure: function (trans, response, args) {
                    userLoginResHandle(response);
                }
            });
        });

    });
}

waitForKeyElements('#userpassword', fixPasswordField);
