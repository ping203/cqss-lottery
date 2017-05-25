/**
 * Created by linyng on 2017/5/17.
 */

function NoDataResponse(result) {
    this.result = result;
}

NoDataResponse.prototype.toString = function () {
    return JSON.stringify(this);
};

function DataResponse(result, data) {
    this.result = result;
    this.data = data;
}

DataResponse.prototype.toString = function () {
    return JSON.stringify(this);
}

module.exports.NoDataResponse = NoDataResponse;
module.exports.DataResponse = DataResponse;