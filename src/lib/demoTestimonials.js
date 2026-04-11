const firstNames = [
  "John",
  "Sarah",
  "Michael",
  "Ashley",
  "David",
  "Jessica",
  "Daniel",
  "Emily",
  "Chris",
  "Amanda",
  "Robert",
  "Nicole",
  "James",
  "Lauren",
  "Anthony",
  "Brittany",
  "Matthew",
  "Olivia",
  "Kevin",
  "Megan",
  "Brian",
  "Rachel",
  "Jason",
  "Stephanie",
  "Eric",
  "Samantha",
  "Tyler",
  "Hannah",
  "Justin",
  "Amber",
];

const lastInitials = ["D.", "M.", "R.", "K.", "S.", "T.", "B.", "L.", "C.", "P."];

const locations = [
  "Miami, FL",
  "Austin, TX",
  "Phoenix, AZ",
  "Atlanta, GA",
  "Denver, CO",
  "Charlotte, NC",
  "Tampa, FL",
  "Seattle, WA",
  "Nashville, TN",
  "Dallas, TX",
  "Brooklyn, NY",
  "San Diego, CA",
  "Orlando, FL",
  "Las Vegas, NV",
  "Chicago, IL",
  "Columbus, OH",
  "Portland, OR",
  "Houston, TX",
  "San Jose, CA",
  "Raleigh, NC",
];

const positiveMessages = [
  "The app is smooth and my payout landed on schedule.",
  "Signing up was quick and the dashboard made my first investment easy to track.",
  "I like how clear the wallet balances and payout history are inside the app.",
  "The platform feels simple to use even when checking performance on my phone.",
  "Funding and monitoring everything from one place made the process much easier.",
  "The property pages are clear and the investor dashboard feels polished.",
  "I was able to review an opportunity, fund my wallet, and follow payouts without confusion.",
  "The app feels organized and the support flow inside InvestAir is straightforward.",
  "I appreciate how easy it is to check my balance, payouts, and withdrawal status.",
  "Everything from login to tracking income windows felt more polished than I expected.",
  "The interface is clean and I had no trouble understanding my next step.",
  "The payout timing matched what I saw in the dashboard and that built confidence for me.",
  "I mainly use the mobile view and the app still feels fast and easy to navigate.",
  "The guided flow helped me understand how duration-based investing works on the platform.",
  "I liked being able to compare opportunities without bouncing around different pages.",
];

const supportRecoveryMessages = [
  "I had a delay viewing my wallet update, but live support replied fast and sorted it out the same day.",
  "My first withdrawal status looked confusing, but live support jumped in quickly and explained each step.",
  "I ran into a login issue at first, but the live support team fixed it faster than I expected.",
  "One payout entry took longer to appear than I wanted, but support answered quickly and confirmed it was processing.",
  "I had trouble finding the right funding screen, but live support guided me through it in a few minutes.",
  "There was a small dashboard sync issue on my side, but support responded fast and helped me refresh everything.",
  "My account verification felt slower than expected, but support kept me updated and got it handled quickly.",
  "I noticed a temporary wallet display problem, and live support resolved it without much back and forth.",
  "A transaction label confused me, but live support explained it clearly and the issue was handled fast.",
  "I hit a minor app issue during funding, but support picked it up quickly and helped me complete the process.",
  "My dashboard was missing one update for a bit, but support assisted fast and the numbers corrected shortly after.",
  "I had questions after submitting a request, and live support answered almost immediately.",
  "A payout note looked off on my screen, but support reviewed it fast and confirmed the correct status.",
  "I had a brief loading problem in the app, but live support stayed on it until it was fixed.",
  "My first experience had one small hiccup, but the quick live support response turned it around.",
];

function buildInvestorName(index) {
  const firstName = firstNames[index % firstNames.length];
  const lastInitial = lastInitials[index % lastInitials.length];
  return `${firstName} ${lastInitial}`;
}

function buildLocation(index) {
  return locations[index % locations.length];
}

function buildMessage(index) {
  if (index % 10 === 0) {
    return supportRecoveryMessages[Math.floor(index / 10) % supportRecoveryMessages.length];
  }

  return positiveMessages[index % positiveMessages.length];
}

function buildRating(index) {
  return index % 10 === 0 ? 4 : 5;
}

export const demoTestimonials = Array.from({ length: 150 }, (_, index) => ({
  id: `testimonial-${index + 1}`,
  name: buildInvestorName(index),
  location: buildLocation(index),
  rating: buildRating(index),
  message: buildMessage(index),
}));
