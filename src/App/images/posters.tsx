import type { CircuitCode } from "@/model";
import aus from "../../assets/posters/aus.jpg";
import shanghai from "@/assets/posters/mcl.jpg";

export const POSTERS: Record<CircuitCode, string> = {
	melbourne: aus,
	shanghai: shanghai,
	suzuka: aus,
	sakhir: shanghai,
	jeddah: aus,
	miami: aus,
	montreal: shanghai,
	"monte-carlo": aus,
	catalunya: shanghai,
	spielberg: aus,
	silverstone: aus,
	"spa-francorchamps": shanghai,
	hungaroring: shanghai,
	zandvoort: aus,
	monza: aus,
	madring: aus,
	baku: aus,
	singapore: aus,
	austin: shanghai,
	"mexico-city": aus,
	interlagos: aus,
	"las-vegas": aus,
	lusail: aus,
	"yas-marina-circuit": aus,
};
