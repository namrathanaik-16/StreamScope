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
	cout<<"---------------------------------------------------------\n";
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
	}
