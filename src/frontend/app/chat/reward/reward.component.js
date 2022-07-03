import template from 'pug-loader!./reward.component.tpl.pug';
export class ChatReward extends HTMLElement {
    constructor(rewardData) {
        super();
        this.innerHTML = template(rewardData);
        this.querySelector('.reward-color').style.background = TEST.redemption.reward.background_color
    }
}