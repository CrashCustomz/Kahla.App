import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';
import { switchMap, map } from 'rxjs/operators';
import { Conversation } from '../Models/Conversation';
import Swal from 'sweetalert2';
import { GroupConversation } from '../Models/GroupConversation';

@Component({
    templateUrl: '../Views/group.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/friends.css']
})

export class GroupComponent implements OnInit {
    public conversation: Conversation;
    public groupMumbers: number;
    private option = { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric' };

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService,
        private router: Router,
        private cache: CacheService
    ) { }

    public ngOnInit(): void {
        this.route.params
            .pipe(
                switchMap((params: Params) => this.apiService.ConversationDetail(+params['id'])),
                map(t => t.value)
            )
            .subscribe(conversation => {
                this.conversation = conversation;
                this.conversation.conversationCreateTime =
                    new Date(this.conversation.conversationCreateTime).toLocaleString([], this.option);
                this.groupMumbers = conversation.users.length;
                this.apiService.GetFile((<GroupConversation>this.conversation).groupImageKey).subscribe(result =>
                    this.conversation.avatarURL = result.file.internetPath);
                this.conversation.users.forEach(user => {
                    if (user.user.headImgFileKey === 739) {
                        user.user.avatarURL = '../../assets/default.jpg';
                    } else {
                        this.apiService.GetFile(user.user.headImgFileKey).subscribe(result =>
                            user.user.avatarURL = result.file.internetPath);
                    }
                });
            });
    }

    public leaveGroup(groupName: string): void {
        Swal({
            title: 'Are you sure to leave this group?',
            type: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.apiService.LeaveGroup(groupName)
                    .subscribe(response => {
                        if (response.code === 0) {
                            Swal('Success', response.message, 'success');
                            this.cache.AutoUpdateUnread(AppComponent.CurrentNav);
                            this.router.navigate(['/kahla/friends']);
                        } else {
                            Swal('Error', response.message, 'error');
                        }
                    });
            }
        });
    }

    public talk(id: number): void {
        this.router.navigate(['/kahla/talking', id]);
    }

    public user(id: string): void {
        this.router.navigate(['kahla/user', id]);
    }
}
