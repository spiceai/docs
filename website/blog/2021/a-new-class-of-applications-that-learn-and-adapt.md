---
date: 2021-12-30
title: 'A New Class of Applications That Learn and Adapt'
type: blog
linkTitle: 'A New Class of Applications That Learn and Adapt'
authors: [phillipleblanc]
categories: [applications, learn-and-adapt]
---

A new class of applications that learn and adapt is becoming possible through machine learning (ML). These applications learn from data and make decisions to achieve the application's goals. In the post [Making apps that learn and adapt](https://blog.spiceai.org/posts/2021/11/05/making-apps-that-learn-and-adapt/), Luke described how developers integrate this ability to learn and adapt as a core part of the application's logic. You can think of the component that does this as a "decision engine." This post will explore a brief history of decision engines and use-cases for this application class.

## History of decision engines

The idea to make intelligent decision-making applications is not new. Developers first created these applications around the 1970s[^1], and they are some of the earliest examples of using artificial intelligence to solve real-world problems.

The first applications used a class of decision engines called "[expert systems](https://en.wikipedia.org/wiki/Expert_system)." A distinguishing trait of expert systems is that they encode human expertise in rules for decision-making. Domain experts created combinations of rules that powered decision-making capabilities.

Some uses of expert systems include:

- [Fault diagnosis](https://ieeexplore.ieee.org/document/9549566)
- ["Smart" operator and troubleshooting manual](https://www.gregstanleyandassociates.com/whitepapers/IFAC91objectPaper.pdf)
- [Recovery from extreme conditions](https://www.gregstanleyandassociates.com/whitepapers/IFAC91objectPaper.pdf)
- [Emergency shutdown](https://www.gregstanleyandassociates.com/whitepapers/IFAC91objectPaper.pdf)

However, the resources required to build expert systems make employing them infeasible for many applications[^2]. They often need a significant time and resource investment to capture and encode expertise into complex rule sets. These systems also do not automatically learn from experience, relying on experts to write more rules to improve decision-making.

With the advent of modern deep-learning techniques and the ability to access significantly more data, it is now possible for the computer, not only the developer, to learn and encode the rules to power a decision engine and improve them over time. The vision for Spice.ai is to make it easy for developers to build this new class of applications. So what are some use-cases for these applications?

## Use cases of decision-making applications

### Reduce energy costs by optimizing air conditioning

**Today**: The air conditioning system for an office building runs on a fixed schedule and is set to a fixed temperature in business hours, only adjusting using in-room sensor data, if at all. This behavior potentially over cools at business close as the outside temperature lowers and the building starts vacating.

**With Spice.ai**: Using Spice.ai, the application combines time-series data from multiple data sources, including the time of day and day of the week, building/room occupancy, and outside temperature, energy consumption, and pricing. The A/C controller application learns how to adjust the air conditioning system as the room naturally cools towards the end of the day. As the occupancy decreases, the decision engine is rewarded for maintaining the desired temperature and minimizing energy consumption/cost.

### Food delivery order dispatching

**Today:** Customers order food delivery with a mobile app. When the order is ready to be picked up from the restaurant, the order is dispatched to a delivery driver by a simple heuristic that chooses the nearest available driver. As the app gets more popular with customers and the number of restaurants, drivers, and customers increases, the heuristic needs to be constantly tuned or supplemented with human operators to handle the demand.

**With Spice.ai**: The application learns which driver to dispatch to minimize delivery time and maximize customer star ratings. It considers several factors from data, including patterns in both the restaurant and driver's order histories. As the number of users, drivers, and customers increases over time, the app adapts to keep up with the changing patterns and demands of the business.

### Routing stock or crypto trades to the best exchange

**Today:** When trading stocks through a broker like Fidelity or TD Ameritrade, your broker will likely route your order to an exchange like the NYSE. And in the emerging world of crypto, you can place your trade or swap directly on a decentralized exchange (DEX) like [Uniswap](https://uniswap.org) or [Pancake Swap](https://pancakeswap.finance/). In both cases, the routing of orders is likely to be either a form of traditional expert system based upon rules or even manually routed.

**With Spice.ai:** A smart order routing application learns from data such as pending transactions, time of day, day of the week, transaction size, and the recent history of transactions. It finds patterns to determine the most optimal route or exchange to execute the transaction and get you the best trade.

## Summary

A new class of applications that can learn and adapt are made possible by integrating AI-powered decision engines. Spice.ai is a decision engine that makes it easy for developers to build these applications.

If you'd like to partner with us in creating this new generation of intelligent decision-making applications, we invite you to join us on [Slack](https://spiceai.org/slack), reach out on [Twitter](https://twitter.com/spice_ai) or [email](mailto:hey@spice.ai) us.

Phillip

[^1]: Russell, Stuart; Norvig, Peter (1995). [Artificial Intelligence: A Modern Approach](http://aima.cs.berkeley.edu/). Simon & Schuster. pp. 22–23. ISBN 978-0-13-103805-9.

[^2]: Kendal, S. L., & Creen, M. (2007). [An introduction to knowledge engineering](https://www.worldcat.org/title/introduction-to-knowledge-engineering/oclc/70987401). London: Springer. ISBN 978-1-84628-475-5
