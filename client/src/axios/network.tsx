// const ip = "26.138.116.36";
// const port_server = "8000";
const isUsingHttps = import.meta.env.VITE_USE_HTTPS && import.meta.env.VITE_USE_HTTPS === 'true';
let host_string = isUsingHttps ? import.meta.env.VITE_API_URL_HTTPS : import.meta.env.VITE_API_URL_HTTP;
if (!host_string) host_string = 'http://localhost:8000';

const getURL = (api: string) => {
    // return 'http://' + ip + ':' + port_server + '/api' + api;
    return `${host_string}/api${api}`;
};

export default getURL;
