import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Player } from '../player.model';
import { Game } from '../game.model';
import { Question } from '../question.model';
import { StudentService } from '../student.service';
import { FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { HostService } from '../host.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  providers: [StudentService, HostService]
})
export class StudentComponent implements OnInit {
  currentGame: FirebaseObjectObservable<any[]>;
  currentStudent: FirebaseObjectObservable<any[]>;
  questions: Question[];
  currentQuestion: Question;
  subGame;
  startTime;
  endTime;
  answered: boolean;

  constructor(private route: ActivatedRoute, private studentService: StudentService, private router: Router, private hostService: HostService) { }

  ngOnInit() {
    var currentGameKey;
    var studentId;
    this.route.params.forEach(urlParameters => {
      this.currentGame = this.hostService.getGameFromCode(urlParameters['roomcode']);
      studentId = urlParameters['studentid'];
    })
    this.currentGame.subscribe(data => {
      currentGameKey = data['$key'];
      this.currentQuestion = data['question_list'][data['current_question']];
    })
    this.currentStudent = this.studentService.getStudentGameKeyAndId(currentGameKey, studentId);
    this.questions = this.hostService.getQuestions();
    this.currentGame.subscribe(data => {
      this.subGame = data;
    })
    this.answered = false;
  }

  ngDoCheck(){
    if(this.subGame['game_state'] == "answer"){
      this.updateGame();
    }else if(this.subGame['game_state'] == 'question'){
      this.answered = false;
      this.startTime = new Date().getTime();
    }
  }

  getStudentAnswer(answer: number){
    var questionAnswer;
    this.endTime = new Date().getTime();
    this.answered = true;
    if(answer == this.currentQuestion.answer){
      this.studentService.editStudentPoints(this.scoringAlgorithm(this.endTime, this.startTime), true);
    }
    else{
      this.studentService.editStudentPoints(this.currentStudent, false);
    }
  }

  scoringAlgorithm(end, start){
    var dif = (end - start);
    var score = (((1 / 2) * Math.log(-(dif-60))) * 500) + 500;
    return score;
  }

  updateGame(){
    this.currentGame.subscribe(data => {
      this.subGame = data;
    })
  }
}
