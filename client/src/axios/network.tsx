const ip = "127.0.0.1";
const port_server = "8000";

const getURL = (api: string) => {
    return 'http://' + ip + ':' + port_server + '/' + api;
};

export default getURL;
