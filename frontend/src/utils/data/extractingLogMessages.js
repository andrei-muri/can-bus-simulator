const extractingLogMessages = (obj, time) => {
    if(!obj.times || obj.times.length === 0) return ["No log messages"];
    const logs = obj.times.flatMap(entry => entry.log_messages);

    const timeNumberRegex = /TIME(\d+)/;

    let logsTillTime = [];

    for (const log of logs) {
        const match = log.match(timeNumberRegex);

        if (match) {
            const timeNumber = parseInt(match[1], 10);
            if (timeNumber <= time) {
                logsTillTime.push(log);
            } else {
                break;
            }
        }
    }

    return logsTillTime;
};

export default extractingLogMessages;
