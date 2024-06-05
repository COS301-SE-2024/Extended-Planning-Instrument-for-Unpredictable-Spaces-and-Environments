<template>
    <div class="route-summary">
        <header>
        <h1>Route summary</h1>
        <div class="miles-info">123 routes · 3,500 - 7,000 miles</div>
        </header>
        <div class="timeline">
        <div v-for="(delivery, index) in deliveries" :key="index" class="timeline-item">
            <div class="timeline-item-content">
            <div class="location-time-wrapper">
                <div class="location">
                <p>{{ delivery.location }}</p>
                <small>{{ delivery.city }}</small>
                </div>
                <div class="time">{{ delivery.time }}</div>
            </div>
            <span class="circle"></span>
            </div>
        </div>
        <button class="start-button">Start!</button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "RouteSummary",
        data() {
            return {
                deliveries: [
                { location: "24091 S State St", city: "Johannesburg, GP", time: "10:00 AM" },
                { location: "3743 E 1060 S", city: "Cape Town, WC", time: "12:00 PM" },
                { location: "84136 S 3005", city: "Durban, KZN", time: "2:00 PM" },
                { location: "84136 S 3005", city: "Pretoria, GP", time: "3:30 PM" },
            ],
            };
        },
    };
</script>

<style scoped>
.route-summary {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header {
    text-align: left;
    margin-bottom: 20px;
}

header h1 {
    font-size: 24px;
    margin-bottom: 5px;
    font-weight: bold;
    color: #000;
}

.miles-info {
    color: #666;
    font-size: 14px;
}

.timeline {
    position: relative;
    padding-left: 20px;
}

.timeline-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
}

.timeline-item-content {
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 10px 20px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
    width: 100%;
}

.location-time-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.timeline-item .location {
    flex-grow: 1;
}

.timeline-item .location p {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    color: #000;
}

.timeline-item .location small {
    color: #999;
    font-size: 12px;
}

.timeline-item .time {
    color: #333;
    font-size: 14px;
    white-space: nowrap;
}

.timeline-item .circle {
    width: 12px;
    height: 12px;
    background-color: #3498db;
    border-radius: 50%;
    position: absolute;
    left: -25px;
}

.timeline::before {
    content: '';
    position: absolute;
    width: 2px;
    background-color: #e3e3e3;
    top: 0;
    bottom: 0;
    left: 10px;
}

.start-button {
    display: block;
    width: 100%;
    padding: 10px 0;
    background-color: #3498db;
    color: #fff;
    text-align: center;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
}

.start-button:hover {
    background-color: #2980b9;
}
</style>
  