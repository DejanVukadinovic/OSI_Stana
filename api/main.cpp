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

crow::json::wvalue edit_discount(const int iddiscounts,const double coefficient) 
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

		stmt = con->prepareStatement("UPDATE discounts SET coefficient=? WHERE discounts.iddiscounts=?");
		stmt->setDouble(1,coefficient) ;
		stmt->setInt(2,iddiscounts);
		res=stmt->executeQuery();

		std::string message="Discount changed";
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

crow::json::wvalue bus_details(const int idbus) {
    try {
        sql::Driver* driver;
        sql::Connection* con;
        sql::PreparedStatement* stmt;
        sql::ResultSet* res;
        crow::json::wvalue result;

        driver = get_driver_instance();
        con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
        std::cout<<"Connected"<<std::endl;
        con->setSchema(getenv("DB_NAME"));

        stmt = con->prepareStatement("SELECT seats, is_working, carrier, idbus_class FROM bus WHERE idbus = ?");
        stmt->setInt(1, idbus);
        res = stmt->executeQuery();

        if (res->next()) {
            result["seats"] = res->getInt("seats");
            result["is_working"] = res->getInt("is_working");
            result["carrier"] = res->getString("carrier");
            result["idbus_class"] = res->getInt("idbus_class");
        }
        else {
            std::string message="Error: No bus found with that id.";
            return result["Message"]=message;
        }

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
        return ret;
    }
}

int main()
{
	crow::SimpleApp app;
	CROW_ROUTE(app, "/")([]()
		{
			return "Hello world!!";
		});
	CROW_ROUTE(app, "/bus_class").methods("POST"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string description = params.get("description");
			const std::string price_coefficient_s = params.get("price_coefficient_s");
			const double price_coefficient= std::stod(price_coefficient_s);
			crow::json::wvalue result = bus_class(description,price_coefficient);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
	CROW_ROUTE(app, "/discount").methods("POST"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string min_age_s = params.get("min_age");
			const int min_age=std::stoi(min_age_s);
			const std::string max_age_s = params.get("max_age");
			const int max_age=std::stoi(max_age_s);
			const std::string coefficient_s = params.get("coefficient");
			const double coefficient= std::stod(coefficient_s);
			crow::json::wvalue result = discount(min_age,max_age,coefficient);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
			
		});
		CROW_ROUTE(app, "/route/set_driver").methods("POST"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string idroute_s = params.get("idroute");
			const int route_a=std::stoi(idroute_s);
			const std::string iddriver_s = params.get("iddriver");
			const int driver_a=std::stoi(iddriver_s);
			crow::json::wvalue result = set_route_driver(route_a,driver_a);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
			
		});
		CROW_ROUTE(app, "/route/delete").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string idroute_s = params.get("idroute");
			const int route_a=std::stoi(idroute_s);
			crow::json::wvalue result = delete_route(route_a);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
			
		});
		CROW_ROUTE(app, "/busclass/delete").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string idbus_class_s = params.get("idbus_class");
			const int idbusclass=std::stoi(idbus_class_s);
			crow::json::wvalue result = delete_busclass(idbusclass);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
			
		});
		CROW_ROUTE(app, "/discounts/delete").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string iddiscounts_s = params.get("iddiscounts");
			const int discounts_a=std::stoi(iddiscounts_s);
			crow::json::wvalue result = delete_discount(discounts_a);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
			
		});
		CROW_ROUTE(app, "/discounts/edit").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string iddiscounts_s = params.get("iddiscounts");
			const int discounts_a=std::stoi(iddiscounts_s);
			const std::string coefficient_s = params.get("coefficient");
			const double coefficient= std::stod(coefficient_s);
			crow::json::wvalue result = edit_discount(discounts_a,coefficient);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
			
		});
		CROW_ROUTE(app, "/bus/details").methods("GET"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string idbus_s = params.get("idbus");
			const int idbus_a=std::stoi(idbus_s);
			crow::json::wvalue result = bus_details(idbus_a);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
			
		});
	std::cout<<"Running on: http://120.0.0.1:3001"<<std::endl;
	app.port(params::port).run();
	return 0;
}

