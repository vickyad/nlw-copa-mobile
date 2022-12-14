import { useState } from 'react'
import { Heading, useToast, VStack } from 'native-base'
import { api } from '../services/api'
import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Input } from '../components/Input'
import { useNavigation } from '@react-navigation/native'

export function Find() {
  const [isLoading, setIsLoading] = useState(false)
  const [code, setCode] = useState('')

  const { navigate } = useNavigation()
  const toast = useToast()

  async function handleJoinPoll() {
    try {
      setIsLoading(true)

      if (!code.trim) {
        return toast.show({
          title: 'Informe o código',
          placement: 'top',
          bgColor: 'red.500',
        })
      }

      await api.post('/polls/join', { code })

      toast.show({
        title: 'Você entrou no bolão com sucesso',
        placement: 'top',
        bgColor: 'green.500',
      })

      navigate('polls')
    } catch (error) {
      setIsLoading(false)

      console.log(error)

      if (error.response?.data?.message === 'Pool not found') {
        return toast.show({
          title: 'Bolão não encontrado',
          placement: 'top',
          bgColor: 'red.500',
        })
      }

      if (error.response?.data?.message === 'You already joined this pool') {
        return toast.show({
          title: 'Você já está nese bolão',
          placement: 'top',
          bgColor: 'red.500',
        })
      }

      toast.show({
        title: 'Não foi possível encontrar o bolão',
        placement: 'top',
        bgColor: 'red.500',
      })
    }
  }
  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Buscar por código" showBackButton />
      <VStack mx={5} alignItems="center">
        <Heading
          fontFamily="heading"
          color="white"
          fontSize="xl"
          my={8}
          textAlign="center"
        >
          Encontre um bolão através de seu código único
        </Heading>
        <Input
          mb={2}
          placeholder="Qual o código do bolão?"
          autoCapitalize="characters"
          onChangeText={(value) => setCode(value)}
          value={code}
        />
        <Button
          title="BUSCAR BOLÃO"
          isLoading={isLoading}
          onPress={handleJoinPoll}
        />
      </VStack>
    </VStack>
  )
}
