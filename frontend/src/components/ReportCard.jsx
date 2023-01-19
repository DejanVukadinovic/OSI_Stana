import axios from "axios"

function ReportCard({report}) {
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}
    const url = `http://127.0.0.1:3004/pdf/report-${report.idreport}.pdf`

    return (
    <div className="p-4 border-2 border-blue-800 rounded-md flex justify-between">
        <div>
        <div>{report.name}</div>
        <div>{report.time.split("T")[0]}</div>
        <div>{report.time.split("T")[1].slice(0,-5)}</div>
        </div>
        <div>
            <a href={url} target="_blank">View report</a>
        </div>
        
    </div> );
}

export default ReportCard;