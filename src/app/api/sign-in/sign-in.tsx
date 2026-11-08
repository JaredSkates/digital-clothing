 
 import {
  Image,
  Text,
  View,
} from 'react-native'

type Props = {
    styles: any
    user: any
    colors: any

}

 export default function SignIn({styles, user, colors} : Props) {
     return ( 
            <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
              {user?.imageUrl && <Image source={{ uri: user.imageUrl }} style={styles.avatar} />}
              <Text style={[styles.email, { color: colors.mutedForeground }]}>
                {user?.primaryEmailAddress?.emailAddress ?? user?.id}
              </Text>
            </View>
     )
 }