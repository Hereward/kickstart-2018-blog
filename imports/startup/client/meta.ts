declare var DocHead: any;

export function addMeta() {
  let metaInfo = { name: "viewport", content: "width=device-width, initial-scale=1" };
  DocHead.addMeta(metaInfo);
  DocHead.setTitle(Meteor.settings.public.MainTitle);
}
