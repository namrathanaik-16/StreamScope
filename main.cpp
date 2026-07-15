#include<iostream>
#include<fstream>
#include "json.hpp"
using json=nlohmann::json;
using namespace std;

int main(){
	ifstream file("playback_session.json");
	if(!file.is_open())
	{
		cout<<"Could not open playback_session.json"<<endl;
		return 1;
	}
	json playbackSession;
	file>>playbackSession;
	json sessionInfo=playbackSession["sessionInfo"];
	json finalStats=playbackSession["finalStatistics"];
	cout<<"\n";
	cout<<"=======================================================\n";
	cout<<"              STREAMSCOPE SESSION REPORT\n";
	cout<<"=======================================================\n";
	cout<<"Session Information\n";
	cout<<"-------------------------------------------------------\n";
	cout<<"Session ID               :"
		<<sessionInfo["sessionId"].get<string>()<<endl;
	cout<<"Start Time               :"
		<<sessionInfo["startTime"].get<string>()<<endl;
	cout<<"End Time                 :"
		<<sessionInfo["endTime"].get<string>()<<endl;
	cout<<"MPD URL                  :"
		<<sessionInfo["mpdUrl"].get<string>()<<endl;
	cout<<"Playback Duration        :"
		<<finalStats["playbackDuration"].get<double>()
		<<" seconds"<<endl;
	cout<<"\n";
	cout<<"Playback Statistics\n";
	cout<<"------------------------------------------------------\n";
	cout<<"Average Bitrate          :"
		<<finalStats["averageBitrateMbps"]<<" Mbps"<<endl;
	cout<<"Highest Bitrate          :"
		<<finalStats["highestBitrateMbps"]<<" Mbps"<<endl;
	cout<<"Lowest Bitrate           :"
		<<finalStats["lowestBitrateMbps"]<<" Mbps"<<endl;
	cout<<"Average Buffer Level     :"
		<<finalStats["averageBufferLevel"]<<" Seconds"<<endl;
	cout<<"Dropped Frames           :"
		<<finalStats["droppedFrames"]<<endl;
	cout<<"Playback Events          :"
		<<finalStats["playbackEvents"]<<endl;
	cout<<"Representation Switches  :"
		<<finalStats["representationSwitches"]<<endl;
	
	cout<<"\n";
	cout<<"Network Summary\n";
	cout<<"-----------------------------------------------------\n";
	cout<<"Total Requests           :"
		<<finalStats["networkRequests"]<<endl;
	cout<<"Completed Requests       :"
	 	<<finalStats["completedRequests"]<<endl;
	cout<<"Abandoned Requests       :"
	 	<<finalStats["abandonedRequests"]<<endl;
	cout<<"Completion Rate          :"
		<<finalStats["completionRate"]<<"%"<<endl;
	cout<<"Data Downloaded          :"
	   	<< finalStats["dataDownloadedMB"]<<" MB"<<endl;
	cout<<"Retry Attempts           :"
		<<finalStats["retryAttempts"]<<endl;
	cout<<"Errors                   :"
		<<finalStats["errors"]<<endl;

	cout<<"\n";
	cout<<"Playback Health\n";
	cout<<"-----------------------------------------------------\n";
	int healthScore=100;
	if(finalStats["droppedFrames"]>0)
		healthScore-=10;
	if(finalStats["completionRate"]<100)
		healthScore-=20;
	if(finalStats["retryAttempts"]>0)
		healthScore-=10;
	if(finalStats["errors"]>0)
		healthScore-=30;

	string healthStatus;
	if(healthScore>=90)
		healthStatus="Excellent";
	else if(healthScore>=75)
		healthStatus="Good";
	else if(healthScore>=50)
		healthStatus="Fair";
	else
		healthStatus="Poor";

	cout<<"Overall Score             :"
		<<healthScore<<"/100"<<endl;
	cout<<"Health Status             :"
		<<healthStatus<<endl;
	cout<<"\nObservations\n";
	if(finalStats["completionRate"]==100)
		cout<<"[OK] Network completed all requests successfully.\n";
	if(finalStats["retryAttempts"]==0)
		cout<<"[OK] No retry attempts detected.\n";
	if(finalStats["errors"]==0)
		cout<<"[OK] No playback errors detected.\n";
	if(finalStats["droppedFrames"]>0)
		cout<<"[WARNING] Dropped frames were observed during playback.\n";
	}
