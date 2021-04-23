
const dbData =()=>{
    const user = encodeURIComponent('ksm-admin');
    const password = encodeURIComponent("iX5eIznC2Hr2wjqySDmqa9QGSGCIOhK");
    const cluster = 'cluster0.bswgp.mongodb.net';

    return {
        url: `mongodb+srv://${user}:${password}@${cluster}/ksm?retryWrites=true&w=majority`
    }
}

module.exports = {dbData}