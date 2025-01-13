---
date: 2022-01-04
title: 'What Data Informs AI-driven Decision Making?'
type: blog
linkTitle: 'What Data Informs AI-driven Decision Making?'
authors: [lukekim]
categories: [data, data engineering]
---

AI unlocks a new generation of intelligent [applications that learn and adapt](https://blog.spiceai.org/posts/2021/11/05/making-apps-that-learn-and-adapt/) from data. These applications use machine learning (ML) to out-perform traditionally developed software. However, the data engineering required to leverage ML is a significant challenge for many product teams. In this post, we'll explore the three classes of data you need to build next-generation applications and how Spice.ai handles runtime data engineering for you.

While ML has many different applications, one way to think about ML in a real-time application that can adapt is as a decision engine. Phillip discussed decision engines and their potential uses in [A New Class of Applications That Learn and Adapt](https://blog.spiceai.org/posts/2021/12/30/a-new-class-of-applications-that-learn-and-adapt/). This decision engine learns and informs the application how to operate. Of course, applications can and do make decisions without ML, but a developer normally has to code that logic. And the intelligence of that code is fixed, whereas ML enables a machine to constantly find the appropriate logic and evolve the code as it learns. For ML to do this, it needs three classes of data.

### The three classes of data for informed decision making

We don't want any decision, though. We want high-quality, informed decisions. If you consider making higher quality, informed decisions over time, you need three classes of information. These classes are historical information, real-time or present information, and the results of your decisions.

Especially recently, stock or crypto trading is something many of us can relate to. To make high-quality, informed investing decisions, you first need general historical information on the price, security, financials, industry, previous trades, etc. You study this information and learn what might make a good investment or trade.

Second, you need a real-time updated stream of data as it happens to make a decision. If you were stock trading, this information might be the stock price on the day or hour you want to make the trade. You need to apply what you learned from historical data to the current information to decide what trade to place.

Finally, if we're going to make better decisions over time, we need to capture and learn from the results of those decisions. Whether you make a great or poor trade, you want to incorporate that experience into your historical learning.

![Three data classes](https://user-images.githubusercontent.com/80174/147721731-d7f6a414-1b8c-44cb-83ef-9cca0bc65b61.png")

Using all three data classes together results in higher quality decisions over time. Broad data across these classes are useful, and we could make some nice trades with that. Still, we can make an even higher quality trading decision with personal context. For example, we may want to consider the individual tax consequences or risk level of the trade for our situation. So each of these classes also comes with global or local variants. We combine global information, like what worked well for everyone, and local experience, what worked well for us and our situation, to make the best, overall informed decision.

### The waterfall approach to data engineering

Consider how you would capture these three data classes and make them available to both the application and ML in the trading example. This data engineering can be a pretty big challenge.

First, you need a way to gather and consume historical information, like stock prices, and keep that updated over time. You need to handle streaming constantly updated real-time data to make runtime decisions on how to operate. You need to capture and match the decisions you make and feed that back into learning. And finally, you need a way to provide personal or local context, like holding off on sell trades until next year, to stay within a tax threshold, or identifying a pattern you like to trade. If all this wasn't enough, as we learned from Phillip's [AI needs AI-ready data](https://blog.spiceai.org/posts/2021/12/05/ai-needs-ai-ready-data/) post, all three data classes need to be in a format that ML can use.

![Traditional app and data integration.](https://user-images.githubusercontent.com/80174/147722263-26333f5e-2da0-4c8c-a042-0c88c37d59be.png")

If you can afford a data or ML team, they may do much of this for you. However, this model starts to look quite waterfall-like and is not suited well to applications that want to learn and adapt in real-time. Like a waterfall approach, you would provide requirements to your data team, and they would do the data engineering required to provide you with the first two classes of data, historical and real-time. They may give you ML-ready data or train an ML model for you. However, there is often a large latency to apply that data or model in your application and a long turn-around time if it does not meet your requirements. In addition, to capture the third class of data, you would need to capture and send the results of the decisions your application made as a result of using those models back to the data team to incorporate in future learning. This latency through the data, decision-making, learning, and adaptation process is often infeasible for a real-world app.

And, if you can't afford a data team, you have to figure out how to do all that yourself.

### The agile approach

Modern software engineering practices have favored agile methodologies to reduce time to learn and adapt applications to customer and business needs. Spice.ai takes inspiration from agile methods to provide developers with a fast, iterative development cycle.

Spice.ai provides mechanisms for making all three classes of data available to both the application and the decision engine. Developers author Spicepods declaring how data should be captured, consumed, and made ML-ready so that all three classes are consistent and ML available.

The Spice.ai runtime exposes developer-friendly APIs and data connectors for capturing and consuming data and annotating that data with personal context. The runtime generates AI-ready data for you and makes it available directly for ML. These APIs also make it easy to capture application decisions and incorporate the resulting learning.

The Spice.ai approach short circuits the traditional waterfall-like data process by keeping as much data as possible application local instead of round-tripping through an external pipeline or team, especially valuable for real-time data. The application can learn and adapt faster by reducing the latency of decision consequences to learning.

Spice.ai enables personalized learning from personal context and experiences through the interpretations mechanism. Interpretations allow an application to provide additional information or an "interpretation" of a time range as input to learning. The trading example could be as simple as labeling a time range as a good time to buy or providing additional contextual information such as tax considerations, etc. Developers can also use interpretations to record the results of decisions with more context than what might be available in the observation space. You can read more about Interpretations in the [Spice.ai docs](https://docs.spiceai.org/concepts/interpretations/).

While Spice.ai focuses on ensuring consistent ML-ready data is available, it does not replace traditional data systems or teams. They still have their place, especially for large historical datasets, and Spice.ai can consume data produced by them. Where possible, especially for application and real-time data, Spice.ai keeps runtime data local to create a virtuous cycle of data from the application to the decision engine and back again, enabling faster and more agile learning and adaption.

![App with Spice.ai.](https://user-images.githubusercontent.com/80174/147721797-707d29b2-f93e-42be-809a-921349049895.png")

### Summary

In summary, to build an intelligent application driven from AI recommended decisions, a significant amount of data engineering can be required to learn, make decisions, and incorporate the results. The Spice.ai runtime enables you as a developer to focus on consuming those decisions and tuning how the AI engine should learn rather than the runtime data engineering.

The potential of the next generation of intelligent applications to improve the quality of our lives is very exciting. Using AI to help applications make better decisions, whether that be AI-assisted investing, improving the energy efficiency of our homes and buildings, or supporting us in deciding on the most appropriate medical treatment, is very promising.

### Learn more and contribute

Even for advanced developers, building intelligent apps that leverage AI is still way too hard. Our mission is to make this as easy as creating a modern web page. If that vision resonates with you, join us!

If you want to get involved, we'd love to talk. Try out [Spice.ai](https://spiceai.org), [email us](mailto:hey@spice.ai) "hey," get in touch on [Discord](https://discord.gg/kZnTfneP5u), or reach out on [Twitter](https://twitter.com/spice_ai).

Luke
