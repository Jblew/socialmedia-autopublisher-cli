import { autopublisher, envMust } from "socialmedia-autopublisher";

export default autopublisher(() => [
    {
        contextDir: `${__dirname}/twitter`,
        source: sourceWordpress({ wpJSONURL: "https://siejmy.pl/wp-json/" }),
        transformation: (post) => ({ ...post }),
        target: targetTwitter({
            accountID: envMUST("TWITTER_SIEJMY_ACCOUNTID"),
            apiKey: envMUST("TWITTER_SIEJMY_APIKEY"),
        })
    }
])