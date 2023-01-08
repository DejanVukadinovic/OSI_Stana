#include <cstdlib>
#include <iostream>
#include "crow.h"
#include "mysql_connection.h"
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <cppconn/prepared_statement.h>

#include "params.h"

#include "string"

crow::json::wvalue bus_class(const std::string description,double price_coefficient)
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

		stmt = con->prepareStatement("INSERT INTO bus_class(description,price_coefficient,deleted) VALUES(?,?,?)");
		stmt->setString(1, description);
		stmt->setDouble(2,price_coefficient) ;
		stmt->setInt(3, 0);
		res=stmt->executeQuery();
		std::string message="Bus class added";
            result["Message"]=message;
		
		delete res;
		delete stmt;
		delete con;
		return result;


	}
	catch (sql::SQLException& e)										
	{																					
		std::cout << "# ERR: SQLException in " << __FILE__;								
		std::cout << "(" << __FUNCTION__ << ") on line " << __LINE__ << std::endl;		
		std::cout << "# ERR: " << e.what();												
		std::cout << " (MySQL error code: " << e.getErrorCode();						
		std::cout << ", SQLState: " << e.getSQLState() << " )" << std::endl;			
		crow::json::wvalue ret;															
		ret["ERROR:"] = e.what();															
		return  ret;																
	}		
}


int main()
{
	crow::SimpleApp app;
	CROW_ROUTE(app, "/")([]()
		{
			return "Hello world!!";
		});
	CROW_ROUTE(app, "/bus_class")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string description = req.get_header_value("description");
			const std::string price_coefficient_s = req.get_header_value("price_coefficient_s");
			double price_coefficient= std::stod(price_coefficient_s);
			crow::json::wvalue result = bus_class(description,price_coefficient);
			return result;
		});
	std::cout<<"Running on: http://120.0.0.1:3001"<<std::endl;
	app.port(params::port).run();
	return 0;
}

