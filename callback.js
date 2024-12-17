// callback.js - Função Netlify que processa a resposta do OAuth2
const axios = require('axios');

exports.handler = async function(event, context) {
    const code = event.queryStringParameters.code;  // Código recebido após a autorização do usuário

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Código não encontrado!' })
        };
    }

    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const DISCORD_REDIRECT_URI = 'https://fenixtranscript.netlify.app/callback';
    const DISCORD_GUILD_ID = '1244462568408481872';  // Substitua pelo seu Guild ID
    const DISCORD_ROLE_ID = '1251431429741740033';  // Substitua pelo seu Role ID

    try {
        // Trocar o código de autorização por um token de acesso
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', null, {
            params: {
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: DISCORD_REDIRECT_URI,
                scope: 'identify guilds'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token } = tokenResponse.data;

        // Usar o token para obter as informações do usuário
        const userInfoResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const userId = userInfoResponse.data.id;

        // Adicionar o cargo ao usuário no servidor
        await axios.put(
            `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${DISCORD_ROLE_ID}`,
            null,
            {
                headers: {
                    Authorization: `Bot ${process.env.BOT_TOKEN}`
                }
            }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Verificação realizada e cargo atribuído!' })
        };

    } catch (error) {
        console.error('Erro ao processar OAuth2:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro ao processar o OAuth2.' })
        };
    }
};
