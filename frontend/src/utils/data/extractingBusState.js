const extractingBusState = (obj, time) => {
    if(!obj.times || obj.times.length === 0) return "recessive";
    return obj.times[time].bus_state;
}

export default extractingBusState;