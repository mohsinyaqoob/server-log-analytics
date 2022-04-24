const fs = require("fs");
const { getHeapStatistics } = require("v8");


const init = () => {

    // Read File
    let logFile = fs.readFileSync('performance-log.txt', 'utf-8');

    // Split file
    const logData = splitFile(logFile)

    // Get unique requests
    const uniquePaths = getUniquePaths(logData)

    // getStats
    let stats = processData(uniquePaths, logData)
    stats = {
        totalRequests: logData.filter(item => item[0].includes("REQUEST")).length,
        totalResponses: logData.filter(item => item[0].includes("RESPONSE")).length,
        stats
    }

    fs.writeFile("profiling.json", JSON.stringify(stats), (err) => {
        if (err)
            throw new Error(err.message)
    });

}

const splitFile = (file) => {
    let newLineSplit = file.split(/\r?\n/);

    // Cleanup
    newLineSplit = newLineSplit.filter(line => !line.includes('[error]'))


    const rowSplit = []
    newLineSplit.forEach(row => {
        const _row = row.split("||")
        rowSplit.push(_row)
    })
    return rowSplit;
}

const getUniquePaths = logFile => {
    let uniquePaths = [];
    for (let i = 0; i < logFile.length; i++) {

        if (!uniquePaths.find(item => item === logFile[i][1])) {
            uniquePaths.push(logFile[i][1])
        }
    }
    return uniquePaths;
}

const processData = (uniquePaths, logData) => {
    const processedData = []
    uniquePaths.forEach(path => {
        const pathData = logData.filter(item => item[1] === path)
        const { hits, requests, responses, ...rest } = getStats(pathData)
        processedData.push({
            path,
            hits,
            requests,
            responses,
            ...rest
        })
    })

    return processedData;
}

const getStats = (pathData) => {
    console.log("PATH DATA: ", pathData)
    // Path data contains all occurances of the URL path inside the log file
    // Get Hits
    const data = {
        requests: 0,
        responses: 0,
        slowest: '0.00',
        fastest: '0.00',
        average: '0.00'
    }

    data.requests = pathData.filter(item => item[0].includes('REQUEST')).length
    data.responses = pathData.filter(item => item[0].includes('RESPONSE')).length

    const slowest = Math.max.apply(null, pathData.map(function (v) {
        return +new Date(v[2]);
    }));

    const fastest = Math.min.apply(null, pathData.map(function (v) {
        return +new Date(v[2]);
    }));

    data.slowest = new Date(slowest)
    data.fastest = new Date(fastest)

    // Questons
    /**
     * What do you mean by slowest? Minimum of responses? or what
     * Same for requests and average
     */

    return data;
}


init()