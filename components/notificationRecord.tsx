import { Alert, AlertIcon, AlertText, BellIcon, InfoIcon } from "@gluestack-ui/themed"

export default function NotificationRecord(props: {notification: {notification_id: string, created_at: string, user_id: string, title: string, body: string, event: string}}) {
  switch(props.notification.event) {
    case 'ApprovePost':
      return (
        <Alert mx="$2.5" action="warning" variant="accent">
          <AlertIcon as={BellIcon} mr="$3" />
          <AlertText>
            {props.notification.title}: {props.notification.body}
          </AlertText>
        </Alert>
      )
    case 'NewSubscriber':
      return (
        <Alert mx="$2.5" action="success" variant="accent">
          <AlertIcon as={BellIcon} mr="$3" />
          <AlertText>
            {props.notification.title}: {props.notification.body}
          </AlertText>
        </Alert>
      )
    case 'Tagged':
      return (
        <Alert mx="$2.5" action="info" variant="accent">
          <AlertIcon as={BellIcon} mr="$3" />
          <AlertText>
            {props.notification.title}: {props.notification.body}
          </AlertText>
        </Alert>
      )
    
  }
  
}