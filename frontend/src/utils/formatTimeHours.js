export function formatTimeHours(totalSeconds){
    const seconds = (totalSeconds % 60).toString();
    const minutes = Math.floor(totalSeconds / 60).toString(); 

    //old method
    // return `${minutes < 10 ? "0".concat(minutes.toString()) : minutes}:${seconds < 10 ? "0".concat(seconds.toString()) : seconds}`

    //using padStart
    return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}
