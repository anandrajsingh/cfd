import { useEffect, useRef, useState } from "react";
import { Assets, Duration, RealtimeUpdate } from "../utils/constant";
import { ISeriesApi, Time, IChartApi, CandlestickData, WhitespaceData, CandlestickSeriesOptions, DeepPartial, CandlestickStyleOptions, SeriesOptionsCommon, createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { Trade } from "../utils/constant";
import { getChartData, processRealUpdate, resetLastCandle } from "../utils/chart_agg_ws_api";
import { SignalingManager } from "../utils/subscription_manager";

export default function ChartComponent({
    duration,
    asset,
    onPriceUpdate
}: {
    duration: Duration,
    asset: Assets,
    onPriceUpdate?: (prices: { bidPrice: number; askPrice: number }) => void;
}) {
    const chartRef = useRef<IChartApi | null>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<string | null>(null);
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const tooltipTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (tooltip) {
            setTooltipVisible(true);
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
            tooltipTimeoutRef.current = window.setTimeout(() => {
                setTooltipVisible(false);
                setTooltip(null);
            }, 1500)
        }
        return () => {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current)
            }
        }
    }, [tooltip])

    useEffect(() => {
        if (!chartContainerRef.current || !asset) return;

        let candleStickSeries: ISeriesApi<
            "Candlestick",
            Time,
            CandlestickData<Time> | WhitespaceData<Time>,
            CandlestickSeriesOptions,
            DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon>
        > | null = null;
        let chart: IChartApi | null = null;
        let unwatch: (() => void) | null = null;

        const initChart = async () => {
            chart = createChart(chartContainerRef.current!, {
                layout: {
                    background: {
                        type: ColorType.VerticalGradient,
                        topColor: "#141D22",
                        bottomColor: "#141D22",
                    },
                    textColor: "#FFFFFF"
                },
                width: chartContainerRef.current!.clientWidth,
                height: chartContainerRef.current!.clientHeight,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,

                    tickMarkFormatter: (time: number) => {
                        const date = new Date(time * 1000);
                        return date.toLocaleTimeString(undefined, {
                            // day: "2-digit",
                            // month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                    }
                },
                localization: {
                    timeFormatter: (time: number) => {
                        const date = new Date(time * 1000);
                        return date.toLocaleString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                    },
                }
            });

            chartRef.current = chart;

            candleStickSeries = chart.addSeries(CandlestickSeries, {
                upColor: "#158BF9",
                downColor: "#EB483F",
                borderVisible: false,
                wickUpColor: "#158BF9",
                wickDownColor: "#EB483F",
            });

            const tickWrapper = (trade: Trade) => {
                if (trade.asset !== asset) return;

                const tick: RealtimeUpdate = {
                    asset: trade.asset,
                    askPrice: trade.askPrice,
                    bidPrice: trade.bidPrice,
                    time: Date.now()
                }


                const candle = processRealUpdate(tick, duration);

                const prices = {
                    bidPrice: trade.bidPrice || 0,
                    askPrice: trade.askPrice || 0
                };
                if (onPriceUpdate && prices.bidPrice > 0 && prices.askPrice > 0) {
                    onPriceUpdate(prices)
                }

                if (candle && candleStickSeries) {
                    candleStickSeries.update(candle)
                }
            }

            const rawData = await getChartData(asset, duration);

            candleStickSeries.setData(rawData)
            chart.timeScale().fitContent();

            const signalingManager = SignalingManager.getInstance();
            unwatch = signalingManager.watch(asset, tickWrapper)

            chartRef.current = chart;
        }

        const handleResize = () => {
            if (chartContainerRef.current && chart) {
                const parent = chartContainerRef.current;
                chart.applyOptions({
                    width: parent.clientWidth,
                    height: parent.clientHeight
                });
                chart.timeScale().fitContent()
            }
        }

        initChart()

        setTimeout(handleResize, 100);

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);

            if (unwatch) {
                unwatch();
                unwatch = null;
            }

            resetLastCandle(asset, duration)

            if (chart) {
                chart.remove()
                chart = null;
            }

            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current)
            }
            candleStickSeries = null
        }
    }, [duration, asset, onPriceUpdate])

    return (
        <div className="text-neutral-50 h-full w-full relative">
            {tooltipVisible && tooltip && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900/90 backdrop-blur-sm border border-neutral-600 rounded-md text-sm shadow-lg transition-opacity">
                    {tooltip}
                </div>
            )}
            <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-600 rounded-lg overflow-hidden h-full w-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-neutral-600/40">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-50">{asset}</h2>
                        <div className="text-sm text-neutral-400">
                            {duration === Duration.candles_1m && "1 Minute Chart"}
                            {duration === Duration.candles_5m && "5 Minute Chart"}
                            {duration === Duration.candles_15m && "15 Minute Chart"}
                            {duration === Duration.candles_1h && "Hourly Chart"}
                            {duration === Duration.candles_4h && "4 Hour Chart"}
                            {duration === Duration.candles_1d && "Daily Chart"}
                            {duration === Duration.candles_1w && "Weekly Chart"}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center border border-neutral-600 rounded-md bg-neutral-800/60 backdrop-blur-sm">
                            <button
                                className="p-2 rounded-l-md hover:bg-neutral-700/50 transition-colors text-neutral-300 hover:text-neutral-50"
                                onClick={() => {
                                    if (chartRef.current) {
                                        const logicalRange = chartRef.current.timeScale().getVisibleLogicalRange();
                                        if (logicalRange !== null) {
                                            const newRange = {
                                                from: logicalRange.from + (logicalRange.to - logicalRange.from) * 0.2,
                                                to: logicalRange.to - (logicalRange.to - logicalRange.from) * 0.2
                                            };
                                            chartRef.current.timeScale().setVisibleLogicalRange(newRange);
                                            setTooltip("Zoomed In")
                                        }
                                    }
                                }}
                                title="Zoom In">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="15.65" />
                                    <line x1="11" y1="8" x2="11" y2="14" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </svg>
                            </button>
                            <div className="w-px h-8 bg-neutral-600" />
                            <button className="p-2 hover:bg-neutral-700/50 transition-colors text-neutral-300 hover:text-neutral-50"
                                onClick={() => {
                                    if (chartRef.current) {
                                        const logicalRange = chartRef.current.timeScale().getVisibleLogicalRange();
                                        if (logicalRange !== null) {
                                            const rangeSize = logicalRange.to - logicalRange.from;
                                            const newRange = {
                                                from: logicalRange.from - rangeSize * 0.2,
                                                to: logicalRange.to + rangeSize * 0.2
                                            }
                                            chartRef.current.timeScale().setVisibleLogicalRange(newRange);
                                            setTooltip("Zoomed Out")
                                        }
                                    }
                                }}
                                title="Zoom Out"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                            </button>
                            <div className="w-px h-8 bg-neutral-600" />
                            <button
                                className="p-2 rounded-r-md hover:bg-neutral-700/50 transition-colors text-neutral-300 hover:text-neutral-50"
                                onClick={() => {
                                    if (chartRef.current) {
                                        chartRef.current.timeScale().fitContent();
                                        setTooltip("Reset Zoom");
                                    }
                                }}
                                title="Reset Zoom"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </button>
                        </div>
                        <button className="p-2 rounded-md hover:bg-neutral-700/50 transition-colors text-neutral-300 hover:text-neutral-50">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="grow">
                    <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
                </div>
            </div>
        </div>
    )
}