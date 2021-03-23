import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CanvasJS from './canvasjs.min';

interface IShotGraph {
  twopp: IPoint[];
  tpp: IPoint[];
  tppt: IPoint[];
  w: IPoint[];
  pp: IPlayoffPoint[];
}

interface IPoint {
  x: number;
  y: number;
}

interface IPlayoffPoint {
  y: number;
  label: string;
}

class TeamStats {
  twopp: number;
  tpp: number;
  tppt: number;
  w: number;
  pp: number;
  ap: number;
}

class PredictionForm {
  twopp: number;
  tpp: number;
  tppt: number;
  w: number;
}

class ShotGraph implements IShotGraph {
  twopp: IPoint[];
  tpp: IPoint[];
  tppt: IPoint[];
  w: IPoint[];
  pp: IPlayoffPoint[];
  ap: IPlayoffPoint[];

  constructor() {
    this.twopp = [];
    this.tpp = [];
    this.tppt = [];
    this.w = [];
    this.pp = [];

  }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  public testSet: any[];
  private httpClient: HttpClient;
  private baseUrl: string;
  private shotGraph: IShotGraph;
  private chart: CanvasJS.Chart;
  private teamStatsArray: TeamStats[];

  predictModel = new PredictionForm();
  predictResult = '';


  constructor(http: HttpClient) {
    this.httpClient = http;
    this.baseUrl = 'http://127.0.0.1:5000/';
    this.teamStatsArray = [];
  }

  predictSeason() {
      const data = this.predictModel;
      const config = { headers: new HttpHeaders().set('Content-Type', 'application/json')};
      this.httpClient.post<any>(this.baseUrl + 'predict', data, config).subscribe(result => {
        if(result.playoffs === 1){
          this.predictResult = `This team is predicted to make the playoffs with a confidence score of ${result.score}`;
        }
        else{
          this.predictResult = `This team is predicted to miss the playoffs with a confidence score of ${result.score}`;
        }
      });
  }

  getShotChart() {
    this.httpClient.get<any[]>(this.baseUrl + 'shotmap').subscribe(result => {
      this.testSet = result;
      this.shotGraph = this.shapeGraphSet(result);
      this.createTeamStatsArray(result);
      this.sortGraphSet();
      this.setupShotPercChart();
      this.setupPlayoffSuccessChart();
      this.setupThreePointComparisonChart();
  }, error => console.error(error));
  }

  shapeGraphSet(dataFromApi: any[]) {
    const result: ShotGraph = new ShotGraph();
    dataFromApi.forEach(element => {
      const twoPP = ({
        x: element.twopp,
        y: element.w
        }) as IPoint;
      result.twopp.push(twoPP);
      const tppt = ({
        x: element.tppt,
        y: element.w
        }) as IPoint;
      result.tppt.push(tppt);
      const tpp = ({
        x: element.tpp,
        y: element.w
      }) as IPoint;
      result.tpp.push(tpp);
      const pp = ({
        y: element.w,
        label: element.pp === 1 ? 'Made Playoffs' : 'Missed Playoffs'
      }) as IPlayoffPoint;
      result.pp.push(pp);
      const ap = ({
        y: element.w
      }) as IPlayoffPoint;
    });
    return result;
  }

  createTeamStatsArray(dataFromApi: any[]) {
    dataFromApi.forEach(element => {
      const res = ({
        twopp: element.twopp,
        tpp: element.tpp,
        w: element.w,
        pp: element.pp,
        ap: element.ap
      }) as TeamStats;
      this.teamStatsArray.push(res);
    });
  }

  sortGraphSet() {
    this.shotGraph.twopp = this.shotGraph.twopp.sort((n1, n2) => n1.x - n2.x);
    this.shotGraph.tpp = this.shotGraph.tpp.sort((n1, n2) => n1.x - n2.x);
    this.shotGraph.tppt = this.shotGraph.tppt.sort((n1, n2) => n1.x - n2.x);
  }

  setupShotPercChart() {
    this.chart = new CanvasJS.Chart('shotPercChartContainer', {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text : 'Shot Percentage against Games Won'
      },
      axisY: {
        title: "Games Won",
        stripLines: [
          {
            value: this.getAveragePlayoffGW(),
            label: 'Avg. Games Won by Playoff Teams'
          }
        ]
      },
      data: [
        {
          type: 'line',
          name: '2 Point Make %',
          dataPoints: this.shotGraph.twopp,
          showInLegend: true
        },
        {
          type: 'line',
          name: '3 Point Make %',
          dataPoints: this.shotGraph.tpp,
          showInLegend: true
        },
        {
          type: 'line',
          name: '% of Shots Taken as 3 Pointers',
          dataPoints: this.shotGraph.tppt,
          showInLegend: true
        }
      ]
    });
    this.chart.render();
  }


  getAveragePlayoffGW() {
    var totalWins = 0;
    var totalTeams = 0;
    this.teamStatsArray.forEach(element => {
      if(element.ap === 1){
        totalWins += element.w;
        totalTeams += 1;
      }
    });
    return totalWins/totalTeams;
  }

  predictedPlayoffWinsArray() {
    const result = [];
    const tsa = this.sortByGamesWon(this.teamStatsArray);
    tsa.forEach(element => {
      result.push({
        y: element.pp,
        x: element.w
      });
    });
    return result;
  }

  actualPlayoffWinsArray() { 
    const result = [];
    const tsa = this.sortByGamesWon(this.teamStatsArray);
    tsa.forEach(element => {
      result.push({
        y: element.ap,
        x: element.w
      });
    });
    return result;
  }

  sortByGamesWon(teamStatsArray: TeamStats[]){
    return teamStatsArray.sort((e1, e2) => e1.w - e2.w);
  }

  setupPlayoffSuccessChart() {
    const chart = new CanvasJS.Chart('playoffSuccessChartContainer', {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text : 'Actual vs Predicted Playoffs Made against Games Won'
      },
      axisY: {
        title: "Games Won",
        stripLines: [
          {
            value: this.getAveragePlayoffGW(),
            label: 'Avg. Games Won by Playoff Teams'
          }
        ]
      },
      axisX: {
        title: 'Playoffs Made'
      },
      data: [
        {
          type: 'line',
          name: 'Actual',
          dataPoints: this.actualPlayoffWinsArray(),
          showInLegend: true
        },
        {
          type: 'line',
          name: 'Predicted',
          dataPoints: this.predictedPlayoffWinsArray(),
          showInLegend: true
        }
      ]
    });
    chart.render();
  }
  getAverageTppPlayoffs() {
    var total = 0;
    var number = 0;
    this.teamStatsArray.forEach(element => {
      if(element.ap === 1){
        total += element.tpp;
        number += 1;
      }
    });
    return total/number;
  }

  setupThreePointComparisonChart() {
    const chart = new CanvasJS.Chart('threePointChartContainer', {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text : 'Comparison of % of Total Shots as 3 Pointers against 3 Point %'
      },
      axisY: {
        title: "3 Point %",
        stripLines: [
          {
            value: this.getAverageTppPlayoffs(),
            label: 'Avg. 3 Point % for Playoff Teams'
          }
        ]
      },
      axisX: {
        title: '% of Total Shots are 3 Pointers'
      },
      data: [
        {
          type: 'line',
          dataPoints: this.threePointPctArray(),
          showInLegend: true
        }
      ]
    });
   chart.render();
  }
  threePointPctArray() {
    var result = [];
    var arrayToUse = this.teamStatsArray.sort((e1, e2) => e1.tppt - e2.tppt);
    arrayToUse.forEach(element => {
      result.push({
        x: element.tppt,
        y: element.tpp
      });
    });
    return result;
  }


  ngOnInit() {
    this.getShotChart();
  }

}

