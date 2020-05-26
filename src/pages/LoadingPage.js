import React, {Component} from 'react';
import ReactLoading from "react-loading";

class LoadingPage extends Component {
  render() {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'rgb(53, 126, 221)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:100
      }}>
        <div>
          <ReactLoading type='bars' color="#fff"/>
          <h3 style={{color: '#fff'}}>Loading...</h3>
        </div>
      </div>
    )
  }
}

export default LoadingPage;
