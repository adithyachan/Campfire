import { Alert, AlertIcon, AlertText, BellIcon, InfoIcon, Pressable } from "@gluestack-ui/themed"
import { router } from "expo-router"

export default function NotificationRecord(props: {notification: {notification_id: string, created_at: string, user_id: string, title: string, body: string, event: string, redirect_to: string}, setShowNotifModal: (b: boolean)=> void}) {
  const rerouteToGroup = () => {
    // if (reroute !== null && reroute !== undefined && reroute.length > 0) {
    router.push({
      pathname: "/group/[id]",
      params: {id: props.notification.redirect_to}
    })
    props.setShowNotifModal(false)
    // }
  }
  const rerouteToProfile = () => {
    router.push({
      pathname: "/account/[id]",
      params: {id: props.notification.redirect_to}
    })
    props.setShowNotifModal(false)
  }
  switch(props.notification.event) {
    case 'ApprovePost':
      return (
        <Pressable

        >
          <Alert mx="$2.5" action="warning" variant="accent">
            <AlertIcon as={BellIcon} mr="$3" />
            <AlertText>
              {props.notification.title}: {props.notification.body}
            </AlertText>
          </Alert>
        </Pressable>
      )
    case 'NewSubscriber':
      return (
        <Pressable
          onPress={rerouteToProfile}
        >
          <Alert mx="$2.5" action="success" variant="accent">
            <AlertIcon as={BellIcon} mr="$3" />
            <AlertText>
              {props.notification.title}: {props.notification.body}
            </AlertText>
          </Alert>
        </Pressable>
      )
    case 'Tagged':
      return (
        <Pressable
          onPress={rerouteToGroup}
        >
          <Alert mx="$2.5" action="info" variant="accent">
            <AlertIcon as={BellIcon} mr="$3" />
            <AlertText>
              {props.notification.title}: {props.notification.body}
            </AlertText>
          </Alert>
        </Pressable>
      )
    
  }
  
}