//import {DocHead} from 'meteor/kadira:dochead';
declare var DocHead:any;

export function addMeta() {
	let metaInfo = {name: 'viewport', content: 'width=device-width, initial-scale=1'};
	DocHead.addMeta(metaInfo);
	//console.log("Added meta tag");
    DocHead.setTitle(Meteor.settings.public.MainTitle);
    //let faScript = 'https://use.fontawesome.com/releases/v5.0.7/js/all.js';
    //DocHead.loadScript(faScript);
};