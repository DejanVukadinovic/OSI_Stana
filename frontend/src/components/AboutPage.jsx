import Footer from "./Footer";
import Navbar from "./Navbar";

function AboutPage() {
    return ( 
    <div className="flex flex-col" style={{minHeight:"100vh"}}>
        <Navbar/>
        <div className="flex-grow p-4">Welcome to Bus++, the ultimate destination for all your bus ticket booking needs. We are a dedicated team of travel enthusiasts who understand the importance of convenience and affordability when it comes to bus travel.
<br/>
Our website is designed to make the bus ticket booking process quick and easy. With just a few clicks, you can search for and book bus tickets from the comfort of your own home. We offer a wide range of bus routes, so you can find the perfect trip to suit your needs. Whether you're traveling for business or pleasure, we've got you covered.
<br />
We also offer a variety of payment options, including credit and debit cards, as well as a secure and reliable booking process. Our customer service team is available 24/7 to assist you with any questions or concerns.
<br />
At Bus++, our mission is to make bus travel more accessible and affordable for everyone. We strive to provide our customers with the best possible experience, and we look forward to helping you plan your next bus journey.</div>
        <Footer/>
    </div> );
}

export default AboutPage;