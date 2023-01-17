function StationCard({data}) {
    return ( 
        <div className="p-4 border-2 border-blue-800 rounded-md flex flex-col justify-between">
        
        <div>{data.name}</div>
        <div>{data.country}</div>
        
    </div>
     );
}

export default StationCard;