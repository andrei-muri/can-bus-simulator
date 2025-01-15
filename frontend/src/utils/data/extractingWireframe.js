const extractingWireframe = (obj, time) => {
    if(!obj.times || obj.times.length === 0) {
        return {
            configuration: obj.configuration,
            names: obj.ecus_meta.names,
            ecus: obj.results.ecus,
            time: 0
        }
    }
    const { log_messages, arbitration_message, bus_state, ...time_data } = obj.times[time];
    return {
        configuration: obj.configuration,
        names: obj.ecus_meta.names,
        ecus: obj.results.ecus,
        ...time_data
    };
}

export default extractingWireframe;