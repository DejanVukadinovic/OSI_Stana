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

crow::json::wvalue bus_class(const std::string description,const double price_coefficient)
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

crow::json::wvalue discount(const int min_age,const int max_age,const double coefficient) 
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

		stmt = con->prepareStatement("INSERT INTO discounts(min_age,max_age,coefficient,deleted) VALUES(?,?,?,?)");
		stmt->setInt(1, min_age);
		stmt->setInt(2, max_age);
		stmt->setDouble(3,coefficient) ;
		stmt->setInt(4, 0);
		res=stmt->executeQuery();

		std::string message="Discount added";
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

crow::json::wvalue set_route_driver(const int idroute, const int iddriver)
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

        stmt = con->prepareStatement("INSERT INTO route_has_driver (idroute,iddriver) VALUES (?,?)");
        stmt->setInt(1, idroute);
        stmt->setInt(2, iddriver);
        res=stmt->executeQuery();

        std::string message="Route and driver set successfully";
        result["Message"] = message;

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

crow::json::wvalue delete_route(const int idroute) 
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

		stmt = con->prepareStatement("UPDATE route SET active=? WHERE route.idroute=?");
		stmt->setInt(1, 0);
		stmt->setInt(2, idroute);
		res=stmt->executeQuery();

		std::string message="Route deleted!";
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

crow::json::wvalue delete_busclass(const int idbus_class) 
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

		stmt = con->prepareStatement("UPDATE bus_class SET deleted=? WHERE bus_class.idbus_class=?");
		stmt->setInt(1, 1);
		stmt->setInt(2, idbus_class);
		res=stmt->executeQuery();

		std::string message="Bus class deleted!";
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

crow::json::wvalue delete_discount(const int iddiscounts) 
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

		stmt = con->prepareStatement("UPDATE discounts SET deleted=? WHERE discounts.iddiscounts=?");
		stmt->setInt(1, 1);
		stmt->setInt(2, iddiscounts);
		res=stmt->executeQuery();

		std::string message="Discount deleted!";
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
			const std::string description = req.get_header_value("description");
			const std::string price_coefficient_s = req.get_header_value("price_coefficient_s");
			const double price_coefficient= std::stod(price_coefficient_s);
			crow::json::wvalue result = bus_class(description,price_coefficient);
			return result;
		});
	CROW_ROUTE(app, "/discount")([](const crow::request& req)
		{
			const std::string min_age_s = req.get_header_value("min_age");
			const int min_age=std::stoi(min_age_s);
			const std::string max_age_s = req.get_header_value("max_age");
			const int max_age=std::stoi(max_age_s);
			const std::string coefficient_s = req.get_header_value("coefficient");
			const double coefficient= std::stod(coefficient_s);
			crow::json::wvalue result = discount(min_age,max_age,coefficient);
			return result;
			
		});
		CROW_ROUTE(app, "/route/set_driver")([](const crow::request& req)
		{
			const std::string idroute_s = req.get_header_value("idroute");
			const int route_a=std::stoi(idroute_s);
			const std::string iddriver_s = req.get_header_value("iddriver");
			const int driver_a=std::stoi(iddriver_s);
			crow::json::wvalue result = set_route_driver(route_a,driver_a);
			return result;
			
		});
		CROW_ROUTE(app, "/route/delete")([](const crow::request& req)
		{
			const std::string idroute_s = req.get_header_value("idroute");
			const int route_a=std::stoi(idroute_s);
			crow::json::wvalue result = delete_route(route_a);
			return result;
			
		});
		CROW_ROUTE(app, "/busclass/delete")([](const crow::request& req)
		{
			const std::string idbus_class_s = req.get_header_value("idbus_class");
			const int idbusclass=std::stoi(idbus_class_s);
			crow::json::wvalue result = delete_busclass(idbusclass);
			return result;
			
		});
		CROW_ROUTE(app, "/discounts/delete")([](const crow::request& req)
		{
			const std::string iddiscounts_s = req.get_header_value("iddiscounts");
			const int discounts_a=std::stoi(iddiscounts_s);
			crow::json::wvalue result = delete_discount(discounts_a);
			return result;
			
		});
	std::cout<<"Running on: http://120.0.0.1:3001"<<std::endl;
	app.port(params::port).run();
	return 0;
}

