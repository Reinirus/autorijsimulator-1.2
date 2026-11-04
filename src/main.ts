import './style.css';
const params=new URLSearchParams(location.search),side=params.get('display'),session=params.get('session');
if((side==='links'||side==='rechts')&&session){void import('./displays/satellite').then(m=>m.startSatellite(side,session));}
else {void import('./app');}
