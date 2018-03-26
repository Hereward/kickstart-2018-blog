import * as jquery from "jquery";
import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-shadow.min.css";

export function validate(context: any, rules: any = "") {
  
  let validationRules = rules ? rules : {};
  console.log(`validate`, validationRules);
  jquery(`.tooltipster, .tooltipsterParent input`).tooltipster({
    trigger: "custom",
    animation: "slide",
    theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
    zIndex: 1400
  });
  jquery(`#${context.formID}`).validate({
    errorPlacement: function ep(error, element) {
      let errorString = jquery(error).text();
      element.tooltipster("content", errorString);
      element.tooltipster("open");
    },
    rules: validationRules,
    submitHandler: form => {
      context.handleSubmit();
    },
    success: function success(label, element) {
      jquery(`#${element.id}`).tooltipster("close");
    }
  });
}
