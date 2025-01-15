const extractingArbitration = (obj, time) => {
    if(!obj.times || obj.times.length === 0) {
        return {
            ecus_msgs: [],
            message: "No ecu"
        }
    }
    let ecus_msgs = [];
    if(obj.times === null) return {};
    obj.times[time].states.forEach((state, index) => {
        if(state === "SENDING") {
            ecus_msgs.push({
                id: index,
                bit: parseInt(obj.times[time].ecus_bits[index]),
                name: obj.ecus_meta.names[index]
            });
        }
    });

    return {
        ecus_msgs: ecus_msgs,
        message: obj.times[time].arbitration_message
    };
}



export default extractingArbitration;