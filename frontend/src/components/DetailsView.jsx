import { useState, useEffect } from "react";
function DetailsView({data}) {
    const [display, setdisplay] = useState()
    useEffect(() => {
        console.log(data)
        const tmp = Object.keys(data).map(el=>{
            return <div className="flex flex-col border-b-2 border-blue-800"><label htmlFor={el}>{el}:</label><input type="text" disabled value={data[el]}></input></div>
        })
        setdisplay(tmp)
    }, [])
    
    return ( <div className="flex flex-col gap-2">{display}</div> );
}

export default DetailsView;