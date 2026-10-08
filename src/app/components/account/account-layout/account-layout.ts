import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-account-layout',
  styleUrl: './account-layout.css',
  templateUrl: './account-layout.html',
})
export class AccountLayout {}
