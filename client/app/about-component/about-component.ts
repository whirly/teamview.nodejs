import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'teamview-about',
    templateUrl: './about-component.html',
    styleUrls: ['./about-component.scss']
})
export class AboutComponent implements OnInit {

    constructor(private route: ActivatedRoute) {
    }

    public async ngOnInit() {
    }

}
