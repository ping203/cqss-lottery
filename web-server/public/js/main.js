__resources__["/main.js"] = {
    meta: {
        mimetype: "application/javascript"
    },
    data: function (exports, require, module, __filename, __dirname) {
        //var config = require('config');
        var clientManager = require('clientManager');

        function main() {
            clientManager.init();
            setDefaultUser();
        }

        function setDefaultUser() {
            if (localStorage) {
                var dusr = localStorage.getItem("username");
                if (dusr) {
                    $('#loginUser').val(dusr);
                }
            }
        }

        //主动调用main函数
        exports.main = main;
    }
};
