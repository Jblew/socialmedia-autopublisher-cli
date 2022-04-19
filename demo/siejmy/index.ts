export default function () {
    return [
        {
            source: wordpress({ wpJSONURL: "https://siejmy.pl/wp-json/" }),
            filter: category({ id: 112 }),
            target: twitter({ accountID: "", apiKey: envMUST("TWITTER_SIEJMY_APIKEY") })
        }
    ]
}