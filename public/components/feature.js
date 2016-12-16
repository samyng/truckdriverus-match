import React from 'react';
import { Component } from 'react';
import axios from 'axios';
import * as styles from '../styles/styles.scss';

export default class Feature extends Component {
  state = {
    fileSelected: false,
    candidatesUploaded: false,
    candidatesSaved: false,
    smsSent: false,
    emailsSent: false
  };

  // componentWillMount() {
  //   console.log("componentWillMount: ", this.state);
  // }
  //
  // componentDidMount() {
  //   console.log("componentDidMount: ", this.state);
  //   if (document.getElementById("userFile").files.length > 0) {
  //     this.setState({ fileSelected: true });
  //   }
  // }

  handleFileSelect() {
    this.setState({ fileSelected: true });
  }

  // handleSubmit(event) {
    // event.preventDefault();
    // var csvToSend = document.getElementById("userFile").files[0];
  //   console.log(csvToSend);
  //   axios.post("/", csvToSend);
  // }

  // handleSubmit(event) {
  //   event.preventDefault();
  //   var csvToSend = document.getElementById("userFile").files[0];
  //
  //   const success = () => {
  //     console.log("success");
  //   };
  //
  //   $.ajax({
  //       type: "POST",
  //       url: 'http://localhost:3000/',
  //       data: csvToSend,
  //       success: success
  //   });
  // }

  sendSMS() {
    axios.post("/sendSMS")
      .then(res => {
        this.setState({
          smsSent: true,
          emailsSent: false
        });
      })
      .catch(() => {
        alert("There was an error sending SMS, please refresh your page and try again");
      });
  }

  sendEmails() {
    axios.post("/sendEmails")
      .then(res => {
        this.setState({
          emailsSent: true,
          smsSent: false
        });
      })
      .catch(() => {
        alert("There was an error sending emails, please refresh your page and try again");
      });
  }

  addCandidates() {
    axios.post("/updateCandidates")
      .then(res => {
        this.setState({ candidatesSaved: true });
      })
      .catch(() => {
        alert("There was an error saving your candidates, please refresh the page and try again");
      });
  }

  renderJobsSent() {
    if (this.state.smsSent) {
      return (
        <div id="successMessage" className="col-xs-12">
          <h1>SMS Sent!</h1>
          <i id="sentSuccess" className="fa fa-paper-plane" aria-hidden="true"></i>
        </div>
      );
    } else if (this.state.emailsSent) {
      return (
        <div id="successMessage" className="col-xs-12">
          <h1>Emails Sent!</h1>
          <i id="sentSuccess" className="fa fa-paper-plane" aria-hidden="true"></i>
        </div>
      );
    }

  }

  render() {
    return (
      <div className="row">
        <div id="feature" className="col-lg-6 col-md-6 col-sm-6 col-xs-6 offset-lg-3">
          <form action="/" method="post" encType="multipart/form-data">

            <h6>To upload and save new candidates, follow the <span className="green_span">3 step</span> process below</h6>
            <hr className="green-hr" />

            <div className="form-group">
              <label for="selectFile"><span className="green_span">1.</span> Select a CSV File to Upload</label>
              <input className="form-control" id="userFile" type="file" name="userFile"></input>
            </div>
            <div className="form-group">
              <label for="uploadFile"><span className="green_span">2.</span> Upload Selected CSV File to the Server</label>
              <input
                className="form-control btn btn-primary"
                type="submit"
                name="submit"
                value="Upload CSV">
              </input>
            </div>
          </form>
          <div className="form-group">
            <label for="addCandidates">
              <span className="green_span">3.</span> Save Uploaded Candidates to the Database
            </label>
            <button className="form-control btn btn-primary" onClick={this.addCandidates.bind(this)}>
              {this.state.candidatesSaved ? <i id="saveCheck" className="fa fa-check-circle-o" aria-hidden="true"></i> : "Save Candidates"}
            </button>
          </div>

          <hr className="green-hr"/>

          <div className="form-group">
            <label for="addCandidates">
              Send SMS to All Matched Candidates
            </label>
            <button className="form-control btn btn-primary" onClick={this.sendSMS.bind(this)}>
              {this.state.smsSent ? <i id="saveCheck" className="fa fa-check-circle-o" aria-hidden="true"></i> : "Send SMS"}
            </button>
          </div>

          <div className="form-group">
            <label for="addCandidates">
              Send Emails to All Matched Candidates
            </label>
            <button className="form-control btn btn-primary" onClick={this.sendEmails.bind(this)}>
              {this.state.emailsSent ? <i id="saveCheck" className="fa fa-check-circle-o" aria-hidden="true"></i> : "Send Emails"}
            </button>
          </div>
        </div>

        {this.renderJobsSent()}

      </div>
    );
  }
}
