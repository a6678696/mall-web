/**
 * 引入axios
 */
import axios from "axios";
import router from "@/router";

/**
 * 请求的IP地址和端口
 * @type {string}
 */
const baseUrl = "http://localhost:8080";

/**
 * 创建axios实例
 * @type {AxiosInstance}
 */
const httpService = axios.create({
    //url前缀-'http:xxx.xxx'
    //baseURL: process.env.BASE_API, // 需自定义
    baseURL: baseUrl,
    //请求超时时间
    timeout: 3000
});

/**
 * 添加请求拦截器
 */
httpService.interceptors.request.use(function (config) {
    //在发送请求之前做些什么
    //获取token
    const token = window.sessionStorage.getItem('token');
    //token为空时跳转到登录页面
    if (token === null) {
        router.push('/');
    } else {
        axios
            .get(baseUrl + '/token/check?token=' + token)
            .then(function (res) {
                //token验证失败跳转到登录页面
                if (res.data.code === 500) {
                    window.sessionStorage.clear();
                    router.replace('/');
                } else {
                    //当前用户身份不是admin时
                    if (res.data.roleName !== 'admin') {
                        window.sessionStorage.clear();
                        router.replace('/');
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    //设置请求头token
    config.headers.token = token;
    return config;
}, function (error) {
    //对请求错误做些什么
    return Promise.reject(error);
});

/**
 * 添加响应拦截器
 */
httpService.interceptors.response.use(function (response) {
    //对响应数据做点什么
    return response;
}, function (error) {
    //对响应错误做点什么
    return Promise.reject(error);
});

/*网络请求部分*/

/**
 * get请求
 *
 * @param url 请求地址
 * @param params 参数
 * @returns {Promise<unknown>}
 */
export function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        httpService({
            url: url,
            method: 'get',
            params: params
        }).then(response => {
            resolve(response);
        }).catch(error => {
            reject(error);
        });
    });
}

/**
 * post请求
 *
 * @param url 请求地址
 * @param params 参数
 * @returns {Promise<unknown>}
 */
export function post(url, params = {}) {
    return new Promise((resolve, reject) => {
        httpService({
            url: url,
            method: 'post',
            data: params
        }).then(response => {
            resolve(response);
        }).catch(error => {
            reject(error);
        });
    });
}

/**
 * 文件上传
 *
 * @param url 请求地址
 * @param params 参数
 * @returns {Promise<unknown>}
 */
export function fileUpload(url, params = {}) {
    return new Promise((resolve, reject) => {
        httpService({
            url: url,
            method: 'post',
            data: params,
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(response => {
            resolve(response);
        }).catch(error => {
            reject(error);
        });
    });
}

export function getServerUrl(url) {
    return baseUrl + url;
}

export default {
    get,
    post,
    fileUpload,
    getServerUrl
}
