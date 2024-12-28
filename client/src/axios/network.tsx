const ip = "localhost";
const port_server = "8000";

const getURL = (api: string) => {
    return 'http://' + ip + ':' + port_server + '/api' + api;
};

export default getURL;
