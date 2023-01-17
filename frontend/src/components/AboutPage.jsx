import Footer from "./Footer";
import Navbar from "./Navbar";

function AboutPage() {
    return ( 
    <div className="flex flex-col" style={{minHeight:"100vh"}}>
        <Navbar/>
        <div className="flex-grow">About us</div>
        <Footer/>
    </div> );
}

export default AboutPage;