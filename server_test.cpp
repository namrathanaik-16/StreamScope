#include<iostream>
#include "httplib.h"
#include "json.hpp"
using namespace std;
using json=nlohmann::json;

int main()
{
    httplib::Server server;
    server.Get("/",[](const httplib::Request&, httplib::Response& res){
        res.set_content("StreamScope Backend Running!","text/plain");
    });
    server.Post("/analyze",[](const httplib::Request& req, httplib::Response& res){
        cout<<"Recieved Request Body:\n";
        json data=json::parse(req.body);
        cout<<"Name:"<<data["name"]<<endl;
        cout<<"Projects:"<<data["project"]<<endl;
        res.set_content("Analyze endpoint reached!","text/plain");
        
    });
    server.listen("0.0.0.0",8000);
    return 0;
}