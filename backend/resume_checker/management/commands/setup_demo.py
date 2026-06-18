from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group


class Command(BaseCommand):
    help = 'Create default user groups and demo accounts'

    def handle(self, *args, **options):
        # Create groups
        admin_group, _ = Group.objects.get_or_create(name='admin')
        recruiter_group, _ = Group.objects.get_or_create(name='recruiter')
        candidate_group, _ = Group.objects.get_or_create(name='candidate')

        self.stdout.write(self.style.SUCCESS('✓ Groups created/verified'))

        # Create demo users
        demo_accounts = [
            {
                'email': 'candidate@demo.com',
                'first_name': 'John',
                'last_name': 'Candidate',
                'password': 'Candidate@123',
                'group': candidate_group,
            },
            {
                'email': 'recruiter@demo.com',
                'first_name': 'Jane',
                'last_name': 'Recruiter',
                'password': 'Recruiter@123',
                'group': recruiter_group,
            },
            {
                'email': 'admin@demo.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'password': 'Admin@123',
                'group': admin_group,
            },
        ]

        for account in demo_accounts:
            group = account.pop('group')
            username = account['email'].split('@')[0]

            # Check if user exists
            if User.objects.filter(email=account['email']).exists():
                user = User.objects.get(email=account['email'])
                self.stdout.write(f'✓ User {account["email"]} already exists')
                # Update password if different
                user.set_password(account['password'])
                user.save()
                self.stdout.write(f'✓ Password updated for {account["email"]}')
            else:
                # Generate unique username
                unique_username = username
                counter = 1
                while User.objects.filter(username=unique_username).exists():
                    unique_username = f"{username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=unique_username,
                    email=account['email'],
                    first_name=account['first_name'],
                    last_name=account['last_name'],
                    password=account['password'],
                )
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created user: {account["email"]}')
                )

            # Assign group
            if not user.groups.filter(pk=group.pk).exists():
                user.groups.add(group)
                self.stdout.write(f'✓ Assigned {group.name} role to {account["email"]}')

        self.stdout.write(self.style.SUCCESS('\n✓ Demo setup complete!'))
        self.stdout.write('\nDemo Credentials:')
        self.stdout.write('  Candidate: candidate@demo.com / Candidate@123')
        self.stdout.write('  Recruiter: recruiter@demo.com / Recruiter@123')
        self.stdout.write('  Admin: admin@demo.com / Admin@123')
